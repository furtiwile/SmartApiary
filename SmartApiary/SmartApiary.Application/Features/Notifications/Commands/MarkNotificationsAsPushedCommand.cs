using MediatR;
using SmartApiary.Application.Common.Models;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Notifications.Commands
{
    public record MarkNotificationsAsPushedCommand(string UserId, List<string> NotificationIds) : IRequest<Result>;

    internal class MarkNotificationsAsPushedHandler(INotificationRepository notificationRepository)
        : IRequestHandler<MarkNotificationsAsPushedCommand, Result>
    {
        public async Task<Result> Handle(MarkNotificationsAsPushedCommand request, CancellationToken ct)
        {
            var userIdResult = EntityId.Create(request.UserId);
            if (userIdResult.IsFailure)
                return Result.Failure("Invalid user id", ErrorType.Validation);

            foreach (var notifIdStr in request.NotificationIds)
            {
                var notifIdResult = EntityId.Create(notifIdStr);
                if (notifIdResult.IsFailure) continue;

                var notification = await notificationRepository.GetByIdAsync(userIdResult.Value, notifIdResult.Value, ct);
                if (notification != null && !notification.IsPushed)
                {
                    notification.MarkAsPushed();
                    await notificationRepository.UpdateAsync(notification, ct);
                }
            }

            return Result.Success();
        }
    }
}
