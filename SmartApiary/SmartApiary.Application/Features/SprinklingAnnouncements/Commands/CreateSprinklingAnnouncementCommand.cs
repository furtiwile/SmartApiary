using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Application.Features.SprinklingAnnouncements.Commands
{
    public record CreateAnnouncementResponse(string AnnouncementId, string WarningMessage, int NotifiedHivesCount);

    public record CreateSprinklingAnnouncementCommand : IRequest<Result<CreateAnnouncementResponse>>
    {
        public string ParcelId { get; init; } = string.Empty;
        public DateTime StartTime { get; init; }
        public double ExpectedDurationHours { get; init; }
        public string PreparationType { get; init; } = string.Empty;
        public bool BypassWeatherValidation { get; init; } = false;
    }

    public class CreateSprinklingAnnouncementValidator : AbstractValidator<CreateSprinklingAnnouncementCommand>
    {
        public CreateSprinklingAnnouncementValidator()
        {
            RuleFor(x => x.ParcelId).NotEmpty();
            RuleFor(x => x.ExpectedDurationHours).GreaterThan(0);
        }
    }

    internal class CreateSprinklingAnnouncementHandler(
        ISprinklingAnnouncementRepository announcementRepository,
        IParcelRepository parcelRepository,
        IApiaryRepository apiaryRepository,
        IHiveRepository hiveRepository,
        IMediator mediator,
        IAnnouncementQueueService announcementQueueService,
        IWeatherService weatherService,
        ICurrentUserContext currentUser
    ) : IRequestHandler<CreateSprinklingAnnouncementCommand, Result<CreateAnnouncementResponse>>
    {
        public async Task<Result<CreateAnnouncementResponse>> Handle(CreateSprinklingAnnouncementCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result<CreateAnnouncementResponse>.Failure("Unauthorized", ErrorType.Unauthorized);

            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
                return Result<CreateAnnouncementResponse>.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);

            var parcel = await parcelRepository.GetByIdAsync(parcelIdResult.Value, ct);
            if (parcel == null)
                return Result<CreateAnnouncementResponse>.Failure("Target parcel does not exist.", ErrorType.NotFound);

            if (parcel.FarmerId.Value != currentUser.UserId)
                return Result<CreateAnnouncementResponse>.Failure("Unauthorized - you do not own this parcel.", ErrorType.Unauthorized);

            var warningMessage = string.Empty;
            if (!request.BypassWeatherValidation)
            {
                var weatherResult = await weatherService.GetWeatherAsync(parcel.Latitude, parcel.Longitude, ct);
                if (weatherResult.IsSuccess)
                {
                    var isWindTooHigh = weatherResult.Value.WindSpeed > 5.0;
                    var isRaining = weatherResult.Value.Precipitation > 0 ||
                                     weatherResult.Value.Description.Contains("rain", StringComparison.OrdinalIgnoreCase);

                    if (isWindTooHigh || isRaining)
                    {
                        warningMessage = "Bad weather conditions - we recommend another date";
                    }
                }
            }

            var utcStartTime = request.StartTime.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(request.StartTime, DateTimeKind.Utc)
                : request.StartTime.ToUniversalTime();

            var announcementResult = SprinklingAnnouncement.Create(
                utcStartTime,
                request.ExpectedDurationHours,
                request.PreparationType,
                false,
                parcelIdResult.Value
            );

            if (announcementResult.IsFailure)
                return Result<CreateAnnouncementResponse>.Failure(announcementResult.Error!.Message, ErrorType.Validation);

            await announcementRepository.SaveAsync(announcementResult.Value, ct);

            // Notify beekeepers live via SignalR and count affected hives
            int totalAffectedHives = 0;
            var apiaries = await apiaryRepository.GetApiariesWithinRadiusAsync(parcel.Latitude, parcel.Longitude, 5000, ct);
            foreach (var apiary in apiaries)
            {
                var hives = await hiveRepository.GetByApiaryIdAsync(apiary.Id, ct);
                totalAffectedHives += hives.Count;

                var warningEvent = new SmartApiary.Domain.Events.PesticideWarningDomainEvent(
                    apiary.Id,
                    apiary.Name,
                    DateTime.UtcNow
                );
                await mediator.Publish(new SmartApiary.Application.Common.DomainEventNotification<SmartApiary.Domain.Events.PesticideWarningDomainEvent>(warningEvent), ct);
            }

            await announcementQueueService.SendAnnouncementMessageAsync(announcementResult.Value.Id.Value, AnnouncementAction.Created, ct);

            var response = new CreateAnnouncementResponse(announcementResult.Value.Id.Value, warningMessage, totalAffectedHives);
            return Result<CreateAnnouncementResponse>.Success(response);
        }
    }
}