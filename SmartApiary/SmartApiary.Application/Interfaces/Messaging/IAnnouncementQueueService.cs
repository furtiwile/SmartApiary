using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Interfaces.Messaging
{
    public interface IAnnouncementQueueService
    {
        Task SendAnnouncementMessageAsync(string announcementId, AnnouncementAction actionType, CancellationToken ct = default);
    }
}
