using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Repositories
{
    internal class NotificationRepository(
        TableServiceClient tableServiceClient,
        IOptions<AzureTableOptions> options,
        ITableKeyProvider<Notification> keyProvider,
        ITableMapper<Notification, NotificationEntity> mapper
    ) : AzureTableRepository<Notification, NotificationEntity>(
            tableServiceClient.GetTableClient(options.Value.NotificationsTable),
            keyProvider,
            mapper
        ), INotificationRepository
    {
        public async Task<Notification?> GetByIdAsync(EntityId userId, EntityId notificationId, CancellationToken ct = default)
        {
            return await base.GetByIdAsync(userId.Value.ToString(), notificationId.Value.ToString(), ct);
        }

        public async Task<IReadOnlyCollection<Notification>> GetByUserIdAsync(EntityId userId, CancellationToken ct = default)
        {
            return await base.QueryByPartitionKeyAsync(userId.Value.ToString(), ct);
        }

        public async Task<IReadOnlyCollection<Notification>> GetUnpushedByUserIdAsync(EntityId userId, CancellationToken ct = default)
        {
            var filter = $"PartitionKey eq '{userId.Value}' and IsPushed eq false";
            return await base.QueryAsync(filter, ct);
        }

        public async Task<IReadOnlyCollection<Notification>> GetUnreadByUserIdAsync(EntityId userId, CancellationToken ct = default)
        {
            var filter = $"PartitionKey eq '{userId.Value}' and IsRead eq false";
            return await base.QueryAsync(filter, ct);
        }

        public async Task SaveAsync(Notification notification, CancellationToken ct = default)
        {
            await base.AddAsync(notification, ct);
        }

        public new async Task UpdateAsync(Notification notification, CancellationToken ct = default)
        {
            await base.UpdateAsync(notification, ct);
        }

        public new async Task DeleteAsync(Notification notification, CancellationToken ct = default)
        {
            await base.DeleteAsync(notification, ct);
        }
    }
}
