using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface ITelemetryRepository
    {
        Task<Telemetry?> GetByIdAsync(EntityId smartScaleId, EntityId telemetryId, CancellationToken ct = default);
        Task<IReadOnlyCollection<Telemetry>> GetBySmartScaleIdAsync(EntityId smartScaleId, CancellationToken ct = default);
        Task<Telemetry?> GetLatestBySmartScaleIdAsync(EntityId smartScaleId, CancellationToken ct = default);
        Task SaveAsync(Telemetry telemetry, CancellationToken ct = default);
        Task<Telemetry?> GetPreviousTelemetryAsync(EntityId smartScaleId, CancellationToken ct = default);
        Task DeleteAllBySmartScaleIdAsync(EntityId smartScaleId, CancellationToken ct = default);
    }
}
