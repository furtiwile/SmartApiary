using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class HiveTableKeyProvider : ITableKeyProvider<Hive>
    {
        public string GetPartitionKey(Hive model)
        {
            return model.ApiaryId.Value;
        }

        public string GetRowKey(Hive model)
        {
            return model.Id.Value;
        }
    }
}
