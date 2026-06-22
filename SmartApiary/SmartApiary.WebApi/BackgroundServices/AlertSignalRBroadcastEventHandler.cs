using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;
using System;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Common;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Events;
using SmartApiary.WebApi.Hubs;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.WebApi.BackgroundServices
{
    public class AlertSignalRBroadcastEventHandler(
        IHubContext<DeviceHub> hubContext,
        IApiaryRepository apiaryRepository,
        IHiveRepository hiveRepository,
        ILogger<AlertSignalRBroadcastEventHandler> logger) : 
        INotificationHandler<DomainEventNotification<AnomalyDetectedDomainEvent>>,
        INotificationHandler<DomainEventNotification<BatteryLowDomainEvent>>,
        INotificationHandler<DomainEventNotification<PesticideWarningDomainEvent>>,
        INotificationHandler<DomainEventNotification<PesticideWarningCancelledDomainEvent>>
    {
        public async Task Handle(DomainEventNotification<PesticideWarningCancelledDomainEvent> notification, CancellationToken ct)
        {
            var alert = notification.Event.Alert;
            var apiaryId = notification.Event.ApiaryId;

            await BroadcastAlertToApiary(alert, apiaryId, ct);
        }
        public async Task Handle(DomainEventNotification<PesticideWarningDomainEvent> notification, CancellationToken ct)
        {
            var alert = notification.Event.Alert;
            var apiaryId = notification.Event.ApiaryId;

            await BroadcastAlertToApiary(alert, apiaryId, ct);
        }

        public async Task Handle(DomainEventNotification<AnomalyDetectedDomainEvent> notification, CancellationToken ct)
        {
            var alert = notification.Event.Alert;
            var scaleId = notification.Event.ScaleId;

            await BroadcastAlert(alert, scaleId, ct);
        }

        public async Task Handle(DomainEventNotification<BatteryLowDomainEvent> notification, CancellationToken ct)
        {
            var alert = notification.Event.Alert;
            var scaleId = notification.Event.ScaleId;

            await BroadcastAlert(alert, scaleId, ct);
        }

        private async Task BroadcastAlert(SmartApiary.Domain.ValueObjects.Alert alert, EntityId scaleId, CancellationToken ct)
        {
            try
            {
                var hive = await hiveRepository.GetBySmartScaleIdAsync(scaleId, ct);
                if (hive != null)
                {
                    var apiary = await apiaryRepository.GetByIdAsync(hive.ApiaryId, ct);
                    if (apiary != null)
                    {
                        var alertDto = new
                        {
                            Title = alert.AlertType == SmartApiary.Domain.Enums.AlertType.PesticideWarning ? "Pesticide Warning" : 
                                    alert.AlertType == SmartApiary.Domain.Enums.AlertType.PesticideWarningCancelled ? "Pesticide Warning Cancelled" :
                                    $"Alert: {alert.AlertType}",
                            Message = alert.Message.Value,
                            Type = alert.AlertType.ToString()
                        };

                        await hubContext.Clients.Group($"beekeeper:{apiary.BeekeeperId.Value}")
                            .SendAsync("ReceiveAlert", alertDto, ct);
                            
                        logger.LogInformation("[SIGNALR] Broadcasted real-time alert to Beekeeper {BeekeeperId}", apiary.BeekeeperId.Value);
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[SIGNALR] Failed to broadcast alert to SignalR.");
            }
        }

        private async Task BroadcastAlertToApiary(SmartApiary.Domain.ValueObjects.Alert alert, EntityId apiaryId, CancellationToken ct)
        {
            try
            {
                var apiary = await apiaryRepository.GetByIdAsync(apiaryId, ct);
                if (apiary != null)
                {
                    var alertDto = new
                    {
                        Title = alert.AlertType == SmartApiary.Domain.Enums.AlertType.PesticideWarning ? "⚠️ Pesticide Warning" : 
                                alert.AlertType == SmartApiary.Domain.Enums.AlertType.PesticideWarningCancelled ? "✅ Pesticide Warning Cancelled" :
                                $"Alert: {alert.AlertType}",
                        Message = alert.Message.Value,
                        Type = alert.AlertType.ToString()
                    };

                    await hubContext.Clients.Group($"beekeeper:{apiary.BeekeeperId.Value}")
                        .SendAsync("ReceiveAlert", alertDto, ct);
                        
                    logger.LogInformation("[SIGNALR] Broadcasted apiary alert to Beekeeper {BeekeeperId}", apiary.BeekeeperId.Value);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[SIGNALR] Failed to broadcast apiary alert to SignalR.");
            }
        }
    }
}
