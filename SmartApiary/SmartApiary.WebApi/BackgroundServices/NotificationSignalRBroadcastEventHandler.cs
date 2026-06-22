using SmartApiary.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Common;
using SmartApiary.Domain.Events;
using SmartApiary.WebApi.Hubs;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.WebApi.BackgroundServices
{
    public class NotificationSignalRBroadcastEventHandler(
        IHubContext<DeviceHub> hubContext,
        ILogger<NotificationSignalRBroadcastEventHandler> logger) : 
        INotificationHandler<DomainEventNotification<NotificationCreatedDomainEvent>>
    {
        public async Task Handle(DomainEventNotification<NotificationCreatedDomainEvent> notificationEvent, CancellationToken ct)
        {
            var notification = notificationEvent.Event.Notification;
            
            try
            {
                var notificationDto = new
                {
                    Id = notification.Id.Value,
                    Message = notification.Message,
                    Type = notification.Type.ToString(),
                    CreatedAt = notification.CreatedAt
                };

                await hubContext.Clients.Group($"private:{notification.UserId.Value}")
                    .SendAsync("ReceiveNotification", notificationDto, ct);
                    
                logger.LogInformation("[SIGNALR] Broadcasted real-time notification to User {UserId}", notification.UserId.Value);
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "[SIGNALR] Failed to broadcast notification to SignalR for User {UserId}.", notification.UserId.Value);
            }
        }
    }
}
