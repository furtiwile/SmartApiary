using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class ActivationTokenTableKeyProvider : ITableKeyProvider<ActivationToken>
    {
        public const string Partition = "ActivationTokens";

        public string GetPartitionKey(ActivationToken model)
        {
            return Partition;
        }

        public string GetRowKey(ActivationToken model)
        {
            return model.TokenHash;
        }
    }
}
