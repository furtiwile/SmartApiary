using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class SprinklingRecordTableKeyProvider : ITableKeyProvider<SprinklingRecord>
    {
        public string GetPartitionKey(SprinklingRecord model)
        {
            // TODO: REVISE
            return model.PreparationType;
        }

        public string GetRowKey(SprinklingRecord model)
        {
            return model.Id.Value;
        }
    }
}
