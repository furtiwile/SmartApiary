using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface ICropRepository
    {
        Task<Crop?> GetByIdAsync(EntityId parcelId, EntityId cropId, CancellationToken ct = default);
        Task<IReadOnlyCollection<Crop>> GetByParcelIdAsync(EntityId parcelId, CancellationToken ct = default);
        Task SaveAsync(Crop crop, CancellationToken ct = default);
        Task UpdateAsync(Crop crop, CancellationToken ct = default);
        Task DeleteAsync(Crop crop, CancellationToken ct = default);
    }
}
