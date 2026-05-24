using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
/* TODO: DELETE
    internal sealed class DeviceStatusTableMapper : ITableMapper<DeviceStatus, DeviceStatusEntity>
    {
        public DeviceStatusEntity ToEntity(DeviceStatus domain)
        {
            return new DeviceStatusEntity
            {
                CurrentPower = domain.CurrentPower.Value,
                LoadPercentage = domain.LoadPercentage,
                LastHeartbeat = domain.LastHeartbeat,
                CurrentFirmwareVersion = domain.CurrentFirmwareVersion.ToString(),
                TargetFirmwareVersion = domain.TargetFirmwareVersion?.ToString(),
                UpdateStatus = domain.UpdateStatus.ToString()
            };
        }
        public DeviceStatus? ToDomain(DeviceStatusEntity entity)
        {
            var deviceType = Enum.TryParse<DeviceType>(entity.PartitionKey, out var parsedType)
                             ? parsedType : DeviceType.Unknown;

            var updateStatus = Enum.TryParse<UpdateStatus>(entity.UpdateStatus, out var parsedStatus)
                               ? parsedStatus : UpdateStatus.UpToDate;

            var deviceStatusResult = DeviceStatus.Load(
                entity.RowKey,
                deviceType,
                entity.CurrentPower,
                entity.LoadPercentage,
                entity.LastHeartbeat,
                entity.CurrentFirmwareVersion,
                entity.TargetFirmwareVersion,
                updateStatus
            );

            if (deviceStatusResult.IsFailure)
                return null;

            return deviceStatusResult.Value;
        }
    }
*/
}
