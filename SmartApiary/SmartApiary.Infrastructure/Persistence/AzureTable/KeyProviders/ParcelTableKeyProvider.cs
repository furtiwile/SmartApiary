using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class ParcelTableKeyProvider : ITableKeyProvider<Parcel>
    {
        public string GetPartitionKey(Parcel model)
        {
            return model.FarmerId.Value;
        }

        public string GetRowKey(Parcel model)
        {
            return model.Id.Value;
        }
    }
}
