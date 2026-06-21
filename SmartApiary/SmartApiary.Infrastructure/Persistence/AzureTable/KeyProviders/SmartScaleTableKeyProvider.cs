using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class SmartScaleTableKeyProvider : ITableKeyProvider<SmartScale>
    {
        public string GetPartitionKey(SmartScale model)
        {
            return model.Status.ToString();
        }

        public string GetRowKey(SmartScale model)
        {
            return model.Id.Value;
        }
    }
}
