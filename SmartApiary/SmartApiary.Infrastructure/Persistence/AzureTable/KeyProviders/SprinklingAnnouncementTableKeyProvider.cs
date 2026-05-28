using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class SprinklingAnnouncementTableKeyProvider : ITableKeyProvider<SprinklingAnnouncement>
    {
        public string GetPartitionKey(SprinklingAnnouncement model)
        {
            return model.ParcelId.Value;
        }

        public string GetRowKey(SprinklingAnnouncement model)
        {
            return model.Id.Value;
        }
    }
}
