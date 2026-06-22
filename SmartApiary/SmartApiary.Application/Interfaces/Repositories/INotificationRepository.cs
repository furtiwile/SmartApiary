using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface INotificationRepository
    {
        Task<Notification?> GetByIdAsync(EntityId userId, EntityId notificationId, CancellationToken ct = default);
        Task<IReadOnlyCollection<Notification>> GetByUserIdAsync(EntityId userId, CancellationToken ct = default);
        Task<IReadOnlyCollection<Notification>> GetUnpushedByUserIdAsync(EntityId userId, CancellationToken ct = default);
        Task<IReadOnlyCollection<Notification>> GetUnreadByUserIdAsync(EntityId userId, CancellationToken ct = default);
        Task SaveAsync(Notification notification, CancellationToken ct = default);
        Task UpdateAsync(Notification notification, CancellationToken ct = default);
        Task DeleteAsync(Notification notification, CancellationToken ct = default);
    }
}
