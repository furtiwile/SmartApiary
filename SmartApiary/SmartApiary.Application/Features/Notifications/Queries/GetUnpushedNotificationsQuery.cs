using MediatR;
using SmartApiary.Application.Common.Models;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Notifications.Queries
{
    public record GetUnpushedNotificationsQuery(string UserId) : IRequest<Result<IReadOnlyCollection<NotificationDto>>>;

    public record NotificationDto(string Id, string Message, string Type, DateTime CreatedAt, bool IsPushed, bool IsRead);

    internal class GetUnpushedNotificationsHandler(INotificationRepository notificationRepository)
        : IRequestHandler<GetUnpushedNotificationsQuery, Result<IReadOnlyCollection<NotificationDto>>>
    {
        public async Task<Result<IReadOnlyCollection<NotificationDto>>> Handle(GetUnpushedNotificationsQuery request, CancellationToken ct)
        {
            var userIdResult = EntityId.Create(request.UserId);
            if (userIdResult.IsFailure)
                return Result<IReadOnlyCollection<NotificationDto>>.Failure("Invalid user id", ErrorType.Validation);

            var notifications = await notificationRepository.GetUnpushedByUserIdAsync(userIdResult.Value, ct);

            var dtos = notifications
                .OrderBy(n => n.CreatedAt)
                .Select(n => new NotificationDto(
                    n.Id.Value.ToString(),
                    n.Message,
                    n.Type.ToString(),
                    n.CreatedAt,
                    n.IsPushed,
                    n.IsRead
                ))
                .ToList()
                .AsReadOnly();

            return Result<IReadOnlyCollection<NotificationDto>>.Success(dtos);
        }
    }
}
