using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
/* TODO: DELETE
    internal class TelemetryTableMapper : ITableMapper<Telemetry, TelemetryEntity>
    {
        public TelemetryEntity ToEntity(Telemetry domain)
        {
            return new TelemetryEntity
            {
                DeviceName = domain.DeviceName,
                ObservationTime = domain.Timestamp,
                Load = domain.LoadPercentage,
                DeviceType = domain.DeviceType.ToString(),
                CurrentPower = domain.CurrentPower.Value,
                NominalPower = domain.NominalPower.Value,
                FirmwareVersion = domain.FirmwareVersion.Value
            };
        }

        public Telemetry? ToDomain(TelemetryEntity entity)
        {
            var type = Enum.TryParse<DeviceType>(entity.PartitionKey, out var parsedType)
                ? parsedType
                : DeviceType.Unknown;

            var parts = entity.RowKey.Split('_');
            var telemetryId = parts.Length > 1 ? parts[1] : entity.RowKey;

            var telemetryResult = Telemetry.Load(
                telemetryId,
                entity.PartitionKey,
                entity.DeviceName,
                type,
                entity.NominalPower,
                entity.CurrentPower,
                entity.ObservationTime,
                entity.FirmwareVersion
            );

            if (telemetryResult.IsFailure)
                return null;

            return telemetryResult.Value;
        }
    }
*/
}
