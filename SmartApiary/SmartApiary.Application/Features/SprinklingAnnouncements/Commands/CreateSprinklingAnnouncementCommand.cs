using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.SprinklingAnnouncements.Commands
{
    public record CreateSprinklingAnnouncementCommand : IRequest<Result<string>>
    {
        public string ParcelId { get; init; } = string.Empty;
        public DateTime StartTime { get; init; }
        public double ExpectedDurationHours { get; init; }
        public string PreparationType { get; init; } = string.Empty;
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
        IAnnouncementQueueService announcementQueueService,
        IWeatherService weatherService,
        ICurrentUserContext currentUser
    ) : IRequestHandler<CreateSprinklingAnnouncementCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(CreateSprinklingAnnouncementCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result<string>.Failure("Unauthorized", ErrorType.Unauthorized);

            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
                return Result<string>.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);

            var parcel = await parcelRepository.GetByIdAsync(parcelIdResult.Value, ct);
            if (parcel == null)
                return Result<string>.Failure("Target parcel does not exist.", ErrorType.NotFound);

            // Verify parcel ownership
            if (parcel.FarmerId.Value != currentUser.UserId)
                return Result<string>.Failure("Unauthorized - you do not own this parcel.", ErrorType.Unauthorized);

            // Hard block: weather validation (SA.pdf requirement - must not spray in bad conditions)
            var weatherResult = await weatherService.GetWeatherAsync(parcel.Latitude, parcel.Longitude, ct);
            if (weatherResult.IsSuccess)
            {
                if (weatherResult.Value.WindSpeed > 5.0)
                    return Result<string>.Failure("Bad weather conditions - postponing is recommended. Wind speed is too high.", ErrorType.Validation);

                if (weatherResult.Value.Precipitation > 0 || weatherResult.Value.Description.Contains("rain", StringComparison.OrdinalIgnoreCase))
                    return Result<string>.Failure("Bad weather conditions - postponing is recommended. Rain detected.", ErrorType.Validation);
            }

            var announcementResult = SprinklingAnnouncement.Create(
                request.StartTime,
                request.ExpectedDurationHours,
                request.PreparationType,
                false,
                parcelIdResult.Value
            );

            if (announcementResult.IsFailure)
                return Result<string>.Failure(announcementResult.Error!.Message, ErrorType.Validation);

            await announcementRepository.SaveAsync(announcementResult.Value, ct);

            await announcementQueueService.SendAnnouncementMessageAsync(announcementResult.Value.Id.Value, AnnouncementAction.Created, ct);

            return Result<string>.Success(announcementResult.Value.Id.Value);
        }
    }
}