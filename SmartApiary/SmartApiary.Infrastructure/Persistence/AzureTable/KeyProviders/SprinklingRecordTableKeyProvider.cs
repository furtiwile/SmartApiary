using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class SprinklingRecordTableKeyProvider : ITableKeyProvider<SprinklingRecord>
    {
        public string GetPartitionKey(SprinklingRecord model)
        {
            return model.AnnouncementId.Value;
        }

        public string GetRowKey(SprinklingRecord model)
        {
            return model.Id.Value;
        }
    }
}
