using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface IHiveInspectionRepository
    {
        Task<HiveInspection?> GetByIdAsync(EntityId hiveId, EntityId inspectionId, CancellationToken ct = default);
        Task<IReadOnlyCollection<HiveInspection>> GetByHiveIdAsync(EntityId hiveId, int pageNumber = 1, int pageSize = 10, CancellationToken ct = default);
        Task SaveAsync(HiveInspection inspection, CancellationToken ct = default);
        Task UpdateAsync(HiveInspection inspection, CancellationToken ct = default);
        Task DeleteAsync(HiveInspection inspection, CancellationToken ct = default);
    }
}
