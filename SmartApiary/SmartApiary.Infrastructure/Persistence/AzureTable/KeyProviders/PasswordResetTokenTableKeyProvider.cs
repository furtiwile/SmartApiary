using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class PasswordResetTokenTableKeyProvider : ITableKeyProvider<PasswordResetToken>
    {
        public const string Partition = "PasswordResetTokens";

        public string GetPartitionKey(PasswordResetToken model)
        {
            return Partition;
        }

        public string GetRowKey(PasswordResetToken model)
        {
            return model.TokenHash;
        }
    }
}
