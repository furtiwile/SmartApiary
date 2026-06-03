using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface IHiveRepository
    {
        Task<Hive?> GetByIdAsync(EntityId hiveId, CancellationToken ct = default);
        Task<Hive?> GetByIdAsync(EntityId apiaryId, EntityId hiveId, CancellationToken ct = default);
        Task<Hive?> GetBySmartScaleIdAsync(EntityId smartScaleId, CancellationToken ct = default);
        Task<IReadOnlyCollection<Hive>> GetByApiaryIdAsync(EntityId apiaryId, CancellationToken ct = default);
        Task SaveAsync(Hive hive, CancellationToken ct = default);
        Task UpdateAsync(Hive hive, CancellationToken ct = default);
        Task DeleteAsync(Hive hive, CancellationToken ct = default);
    }
}
