using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Messaging
{
    public interface IAlertQueueService
    {
        Task SendAlertAsync(Alert alert, CancellationToken ct = default);
    }
}
