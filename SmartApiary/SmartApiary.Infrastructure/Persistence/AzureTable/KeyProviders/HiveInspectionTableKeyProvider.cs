using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class HiveInspectionTableKeyProvider : ITableKeyProvider<HiveInspection>
    {
        public string GetPartitionKey(HiveInspection model)
        {
            return model.HiveId.Value;
        }

        public string GetRowKey(HiveInspection model)
        {
            return model.Id.Value;
        }
    }
}
