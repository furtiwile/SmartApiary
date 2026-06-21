using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class UserTableKeyProvider : ITableKeyProvider<User>
    {
        public string GetPartitionKey(User model)
        {
            return model.Role.ToString();
        }

        public string GetRowKey(User model)
        {
            return model.Id.Value;
        }
    }
}
