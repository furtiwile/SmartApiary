using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface IApiaryRepository
    {
        Task<IReadOnlyCollection<Apiary>> GetAllAsync(CancellationToken ct = default);
        Task<Apiary?> GetByIdAsync(EntityId beekeeperId, EntityId apiaryId, CancellationToken ct = default);
        Task<IReadOnlyCollection<Apiary>> GetByBeekeeperIdAsync(EntityId beekeeperId, CancellationToken ct = default);
        Task SaveAsync(Apiary apiary, CancellationToken ct = default);
        Task UpdateAsync(Apiary apiary, CancellationToken ct = default);
        Task DeleteAsync(Apiary apiary, CancellationToken ct = default);
    }
}
