using SmartApiary.Domain.Enums;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Application.Interfaces.Messaging
{
    public interface IAnnouncementQueueService
    {
        Task SendAnnouncementMessageAsync(string announcementId, AnnouncementAction actionType, CancellationToken ct = default);
    }
}
