using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

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

    internal class RescheduleSprinklingAnnouncementHandler(ISprinklingAnnouncementRepository announcementRepository)
        : IRequestHandler<RescheduleSprinklingAnnouncementCommand, Result>
    {
        public async Task<Result> Handle(RescheduleSprinklingAnnouncementCommand request, CancellationToken ct)
        {
            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
                return Result.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);

            var announcementIdResult = EntityId.Create(request.AnnouncementId);
            if (announcementIdResult.IsFailure)
                return Result.Failure(announcementIdResult.Error!.Message, ErrorType.Validation);

            var announcement = await announcementRepository.GetByIdAsync(parcelIdResult.Value, announcementIdResult.Value, ct);
            if (announcement == null)
                return Result.Failure("Announcement not found", ErrorType.NotFound);

            announcement.StartTime = request.StartTime;
            announcement.ExpectedDurationHours = request.ExpectedDurationHours;
            announcement.PreparationType = request.PreparationType;
            announcement.IsCancelled = false;

            await announcementRepository.UpdateAsync(announcement, ct);

            return Result.Success();
        }
    }
}
