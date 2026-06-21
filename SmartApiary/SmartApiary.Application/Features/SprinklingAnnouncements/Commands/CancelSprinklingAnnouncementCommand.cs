using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.SprinklingAnnouncements.Commands
{
    public record CancelSprinklingAnnouncementCommand : IRequest<Result>
    {
        public string ParcelId { get; init; } = string.Empty;
        public string AnnouncementId { get; init; } = string.Empty;
    }

    public class CancelSprinklingAnnouncementValidator : AbstractValidator<CancelSprinklingAnnouncementCommand>
    {
        public CancelSprinklingAnnouncementValidator()
        {
            RuleFor(x => x.ParcelId).NotEmpty();
            RuleFor(x => x.AnnouncementId).NotEmpty();
        }
    }

    internal class CancelSprinklingAnnouncementHandler(
        ISprinklingAnnouncementRepository repository,
        IParcelRepository parcelRepository,
        IAnnouncementQueueService announcementQueueService,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<CancelSprinklingAnnouncementCommand, Result>
    {
        public async Task<Result> Handle(CancelSprinklingAnnouncementCommand request, CancellationToken ct)
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
                return Result.Failure("Parcel not found", ErrorType.NotFound);

            if (parcel.FarmerId.Value != currentUser.UserId)
                return Result.Failure("Unauthorized - you do not own this parcel.", ErrorType.Unauthorized);

            var announcement = await repository.GetByIdAsync(parcelIdResult.Value, announcementIdResult.Value, ct);
            if (announcement == null)
                return Result.Failure("Announcement not found", ErrorType.NotFound);

            announcement.Cancel();
            await repository.UpdateAsync(announcement, ct);

            await announcementQueueService.SendAnnouncementMessageAsync(announcement.Id.Value, AnnouncementAction.Cancelled, ct);

            return Result.Success();
        }
    }
}