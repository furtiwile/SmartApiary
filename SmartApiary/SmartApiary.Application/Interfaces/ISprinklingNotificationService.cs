using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Application.Interfaces
{
    public interface ISprinklingNotificationService
    {
        Task SendAlertToBeekeeperAsync(string beekeeperId, string title, string message, CancellationToken ct);
    }
}