using Microsoft.AspNetCore.SignalR;
using SmartApiary.Application.Interfaces;
using SmartApiary.WebApi.Hubs;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.WebApi.Services
{
    public class SignalRSprinklingNotificationService(IHubContext<DeviceHub> hubContext) : ISprinklingNotificationService
    {
        public async Task SendAlertToBeekeeperAsync(string beekeeperId, string title, string message, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(beekeeperId)) return;

            string groupName = $"beekeeper:{beekeeperId}";

            await hubContext.Clients.Group(groupName).SendAsync("ReceiveNotification", new
            {
                title = title,
                body = message,
                type = "SprinklingAlert",
                timestamp = DateTime.UtcNow
            }, ct);
        }
    }
}