using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class NotificationTableKeyProvider : ITableKeyProvider<Notification>
    {
        public string GetPartitionKey(Notification model)
        {
            return model.UserId.Value.ToString();
        }

        public string GetRowKey(Notification model)
        {
            return model.Id.Value.ToString();
        }
    }
}
