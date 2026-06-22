using SmartApiary.Application.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Functions.Services
{
    public class NullSprinklingNotificationService : ISprinklingNotificationService
    {
        public Task SendAlertToBeekeeperAsync(string beekeeperId, string title, string message, CancellationToken ct)
        {
            return Task.CompletedTask;
        }

        public Task BroadcastNotifiedCountToFarmerAsync(string announcementId, int count, CancellationToken ct)
        {
            return Task.CompletedTask;
        }
    }
}