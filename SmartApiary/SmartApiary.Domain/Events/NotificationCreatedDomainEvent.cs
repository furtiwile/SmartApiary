using SmartApiary.Domain.Common;
using SmartApiary.Domain.Models;

namespace SmartApiary.Domain.Events
{
    public sealed record NotificationCreatedDomainEvent(Notification Notification) : IDomainEvent
    {
        public DateTime OccurredOn => Notification.CreatedAt;
    }
}
