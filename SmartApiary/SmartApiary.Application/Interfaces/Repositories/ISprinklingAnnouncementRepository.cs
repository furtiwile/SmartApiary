using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface ISprinklingAnnouncementRepository
    {
        Task<SprinklingAnnouncement?> GetByIdAsync(EntityId parcelId, EntityId announcementId, CancellationToken ct = default);
        Task<IReadOnlyCollection<SprinklingAnnouncement>> GetByParcelIdAsync(EntityId parcelId, CancellationToken ct = default);
        Task SaveAsync(SprinklingAnnouncement announcement, CancellationToken ct = default);
        Task UpdateAsync(SprinklingAnnouncement announcement, CancellationToken ct = default);
        Task DeleteAsync(SprinklingAnnouncement announcement, CancellationToken ct = default);

        Task<IReadOnlyCollection<SprinklingAnnouncement>> GetAllAsync(CancellationToken ct = default);
    }
}
