using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;

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
