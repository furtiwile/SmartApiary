using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface ISprinklingRecordRepository
    {
        Task<SprinklingRecord?> GetByIdAsync(EntityId announcementId, EntityId recordId, CancellationToken ct = default);
        Task<IReadOnlyCollection<SprinklingRecord>> GetByAnnouncementIdAsync(EntityId announcementId, CancellationToken ct = default);
        Task SaveAsync(SprinklingRecord record, CancellationToken ct = default);
        Task UpdateAsync(SprinklingRecord record, CancellationToken ct = default);
        Task DeleteAsync(SprinklingRecord record, CancellationToken ct = default);
    }
}
