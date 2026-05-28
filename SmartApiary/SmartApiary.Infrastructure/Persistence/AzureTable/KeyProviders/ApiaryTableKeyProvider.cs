using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class ApiaryTableKeyProvider : ITableKeyProvider<Apiary>
    {
        public string GetPartitionKey(Apiary model)
        {
            return model.BeekeeperId.Value;
        }

        public string GetRowKey(Apiary model)
        {
            return model.Id.Value;
        }
    }
}
