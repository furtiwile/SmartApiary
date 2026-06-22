using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class NotificationTableMapper : ITableMapper<Notification, NotificationEntity>
    {
        public NotificationEntity ToEntity(Notification domain)
        {
            return new NotificationEntity
            {
                UserId = domain.UserId.Value.ToString(),
                Message = domain.Message,
                Type = domain.Type.ToString(),
                CreatedAt = domain.CreatedAt,
                IsPushed = domain.IsPushed,
                IsRead = domain.IsRead
            };
        }

        public Notification? ToDomain(NotificationEntity entity)
        {
            var idResult = EntityId.Create(entity.RowKey);
            var userIdResult = EntityId.Create(entity.PartitionKey);
            
            if (idResult.IsFailure || userIdResult.IsFailure)
                return null;

            if (!Enum.TryParse<AlertType>(entity.Type, out var type))
                type = AlertType.Info;

            var notificationResult = Notification.Load(
                idResult.Value,
                userIdResult.Value,
                entity.Message,
                type,
                entity.CreatedAt,
                entity.IsPushed,
                entity.IsRead
            );

            if (notificationResult.IsFailure)
                return null;

            return notificationResult.Value;
        }
    }
}
