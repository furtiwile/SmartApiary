using FluentValidation;
using MediatR;
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
        IAnnouncementQueueService announcementQueueService
    )
        : IRequestHandler<CancelSprinklingAnnouncementCommand, Result>
    {
        public async Task<Result> Handle(CancelSprinklingAnnouncementCommand request, CancellationToken ct)
        {
            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
                return Result.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);

            var announcementIdResult = EntityId.Create(request.AnnouncementId);
            if (announcementIdResult.IsFailure)
                return Result.Failure(announcementIdResult.Error!.Message, ErrorType.Validation);

            var announcement = await repository.GetByIdAsync(parcelIdResult.Value, announcementIdResult.Value, ct);
            if (announcement == null)
                return Result.Failure("Announcement not found", ErrorType.NotFound);

            announcement.IsCancelled = true;
            await repository.UpdateAsync(announcement, ct);

            await announcementQueueService.SendAnnouncementMessageAsync(announcement.Id.Value, AnnouncementAction.Cancelled, ct);

            return Result.Success();
        }
    }
}
