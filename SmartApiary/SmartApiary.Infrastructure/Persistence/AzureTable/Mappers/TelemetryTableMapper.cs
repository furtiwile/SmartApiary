using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class TelemetryTableMapper : ITableMapper<Telemetry, TelemetryEntity>
    {
        public TelemetryEntity ToEntity(Telemetry domain)
        {
            return new TelemetryEntity
            {
                SmartScaleId = domain.SmartScaleId.Value,
                HiveId = domain.HiveId.Value,
                Timestamp = domain.Timestamp,
                WeightKg = domain.WeightKg,
                TemperatureC = domain.TemperatureC,
                HumidityPercent = domain.HumidityPercent,
                BatteryPercent = domain.BatteryPercent
            };
        }

        public Telemetry? ToDomain(TelemetryEntity entity)
        {
            var telemetryResult = Telemetry.Load(
                entity.RowKey,
                entity.SmartScaleId,
                entity.HiveId,
                entity.Timestamp,
                entity.WeightKg,
                entity.TemperatureC,
                entity.HumidityPercent,
                entity.BatteryPercent
            );

            if (telemetryResult.IsFailure)
                return null;

            return telemetryResult.Value;
        }
    }
}
