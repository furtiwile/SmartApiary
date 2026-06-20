using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class SprinklingRecordTableMapper : ITableMapper<SprinklingRecord, SprinklingRecordEntity>
    {
        public SprinklingRecordEntity ToEntity(SprinklingRecord domain)
        {
            return new SprinklingRecordEntity
            {
                ActualStartTime = domain.ActualStartTime,
                ActualEndTime = domain.ActualEndTime,
                PreparationType = domain.PreparationType,
                WindSpeed = domain.WindSpeed,
                Precipitation = domain.Precipitation,
                WeatherCondition = domain.WeatherCondition,
                AnnouncementId = domain.AnnouncementId.Value
            };
        }

        public SprinklingRecord? ToDomain(SprinklingRecordEntity entity)
        {
            var sprinklingRecordResult = SprinklingRecord.Load(
                entity.RowKey,
                entity.ActualStartTime,
                entity.ActualEndTime,
                entity.PreparationType,
                entity.WindSpeed,
                entity.Precipitation,
                entity.WeatherCondition,
                entity.AnnouncementId
            );

            if (sprinklingRecordResult.IsFailure)
                return null;

            return sprinklingRecordResult.Value;
        }
    }
}
