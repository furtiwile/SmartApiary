using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class Notification : AggregateRoot
    {
        public EntityId Id { get; private set; }
        public EntityId UserId { get; private set; }
        public string Message { get; private set; } = string.Empty;
        public AlertType Type { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public bool IsPushed { get; private set; }
        public bool IsRead { get; private set; }

        private Notification(
            EntityId id,
            EntityId userId,
            string message,
            AlertType type,
            DateTime createdAt,
            bool isPushed,
            bool isRead)
        {
            Id = id;
            UserId = userId;
            Message = message;
            Type = type;
            CreatedAt = createdAt;
            IsPushed = isPushed;
            IsRead = isRead;
        }

        public void MarkAsPushed()
        {
            IsPushed = true;
        }

        public void MarkAsRead()
        {
            IsRead = true;
        }

        public static Result<Notification> Create(
            EntityId userId,
            string message,
            AlertType type,
            DateTime createdAt)
        {
            if (string.IsNullOrWhiteSpace(message))
                return Result<Notification>.Failure("Message is required");

            var notification = new Notification(
                EntityId.New(),
                userId,
                message,
                type,
                createdAt,
                false,
                false
            );

            notification.AddDomainEvent(new SmartApiary.Domain.Events.NotificationCreatedDomainEvent(notification));

            return Result<Notification>.Success(notification);
        }

        public static Result<Notification> Load(
            EntityId id,
            EntityId userId,
            string message,
            AlertType type,
            DateTime createdAt,
            bool isPushed,
            bool isRead)
        {
            if (string.IsNullOrWhiteSpace(message))
                return Result<Notification>.Failure("Message is required");

            return Result<Notification>.Success(
                new Notification(
                    id,
                    userId,
                    message,
                    type,
                    createdAt,
                    isPushed,
                    isRead
                )
            );
        }
    }
}
