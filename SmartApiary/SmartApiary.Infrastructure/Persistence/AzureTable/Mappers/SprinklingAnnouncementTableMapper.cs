using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class SprinklingAnnouncementTableMapper : ITableMapper<SprinklingAnnouncement, SprinklingAnnouncementEntity>
    {
        public SprinklingAnnouncementEntity ToEntity(SprinklingAnnouncement domain)
        {
            return new SprinklingAnnouncementEntity
            {
                StartTime = domain.StartTime,
                ExpectedDurationHours = domain.ExpectedDurationHours,
                PreparationType = domain.PreparationType,
                IsCancelled = domain.IsCancelled,
                ParcelId = domain.ParcelId.Value,
                NotifiedBeekeepersCount = domain.NotifiedBeekeepersCount
            };
        }

        public SprinklingAnnouncement? ToDomain(SprinklingAnnouncementEntity entity)
        {
            var sprinklingAnnouncementResult = SprinklingAnnouncement.Load(
                entity.RowKey,
                entity.StartTime,
                entity.ExpectedDurationHours,
                entity.PreparationType,
                entity.IsCancelled,
                entity.ParcelId,
                entity.NotifiedBeekeepersCount
            );

            if (sprinklingAnnouncementResult.IsFailure)
                return null;

            return sprinklingAnnouncementResult.Value;
        }
    }
}
