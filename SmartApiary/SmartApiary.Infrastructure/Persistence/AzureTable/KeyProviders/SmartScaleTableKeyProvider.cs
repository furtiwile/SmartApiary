using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
