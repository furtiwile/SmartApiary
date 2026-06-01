using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Messaging
{
    public interface ITelemetryQueueService
    {
        Task SendTelemetryAsync(Telemetry telemetry, CancellationToken ct = default);
        Task<IReceivedMessage<Telemetry>?> ReceiveTelemetryAsync(CancellationToken ct = default);
    }
}
