using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Application.Features.SprinklingAnnouncements.Commands
{
    public record RescheduleSprinklingAnnouncementCommand : IRequest<Result>
    {
        public string ParcelId { get; init; } = string.Empty;
        public string AnnouncementId { get; init; } = string.Empty;
        public DateTime StartTime { get; init; }
        public double ExpectedDurationHours { get; init; }
        public string PreparationType { get; init; } = string.Empty;
    }

    public class RescheduleSprinklingAnnouncementValidator : AbstractValidator<RescheduleSprinklingAnnouncementCommand>
    {
        public RescheduleSprinklingAnnouncementValidator()
        {
            RuleFor(x => x.ParcelId).NotEmpty();
            RuleFor(x => x.AnnouncementId).NotEmpty();
            RuleFor(x => x.ExpectedDurationHours).GreaterThan(0);
        }
    }

    internal class RescheduleSprinklingAnnouncementHandler(
        ISprinklingAnnouncementRepository repository,
        IAnnouncementQueueService announcementQueueService,
        IWeatherService weatherService,
        IParcelRepository parcelRepository,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<RescheduleSprinklingAnnouncementCommand, Result>
    {
        public async Task<Result> Handle(RescheduleSprinklingAnnouncementCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result.Failure("Unauthorized", ErrorType.Unauthorized);

            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
                return Result.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);

            var announcementIdResult = EntityId.Create(request.AnnouncementId);
            if (announcementIdResult.IsFailure)
                return Result.Failure(announcementIdResult.Error!.Message, ErrorType.Validation);

            // Verify parcel ownership
            var parcel = await parcelRepository.GetByIdAsync(parcelIdResult.Value, ct);
            if (parcel == null)
                return Result.Failure("Target parcel does not exist.", ErrorType.NotFound);

            if (parcel.FarmerId.Value != currentUser.UserId)
                return Result.Failure("Unauthorized - you do not own this parcel.", ErrorType.Unauthorized);

            var announcement = await repository.GetByIdAsync(parcelIdResult.Value, announcementIdResult.Value, ct);
            if (announcement == null)
                return Result.Failure("Announcement not found", ErrorType.NotFound);

            // Hard block: weather validation
            var weatherResult = await weatherService.GetWeatherAsync(parcel.Latitude, parcel.Longitude, ct);
            if (weatherResult.IsSuccess)
            {
                if (weatherResult.Value.WindSpeed > 5.0)
                    return Result.Failure("Bad weather conditions - postponing is recommended. Wind speed is too high.", ErrorType.Validation);

                if (weatherResult.Value.Precipitation > 0 || weatherResult.Value.Description.Contains("rain", StringComparison.OrdinalIgnoreCase))
                    return Result.Failure("Bad weather conditions - postponing is recommended. Rain detected.", ErrorType.Validation);
            }

            announcement.Reschedule(request.StartTime, request.ExpectedDurationHours, request.PreparationType);
            await repository.UpdateAsync(announcement, ct);

            await announcementQueueService.SendAnnouncementMessageAsync(announcement.Id.Value, AnnouncementAction.Rescheduled, ct);

            return Result.Success();
        }
    }
}