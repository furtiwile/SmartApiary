using System;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class SmartScaleTableMapper : ITableMapper<SmartScale, SmartScaleEntity>
    {
        public SmartScaleEntity ToEntity(SmartScale domain)
        {
            return new SmartScaleEntity
            {
                SerialNumber = domain.SerialNumber,
                HardwareId = domain.HardwareId,
                DeviceToken = domain.DeviceToken,
                Status = domain.Status.ToString(),
                LatestReading = domain.LatestReading,
                TimeOfLastReading = DateTime.SpecifyKind(domain.TimeOfLastReading, DateTimeKind.Utc)
            };
        }

        public SmartScale? ToDomain(SmartScaleEntity entity)
        {
            var type = Enum.TryParse<DeviceStatusEnum>(entity.Status, out var parsedType)
                ? parsedType
                : DeviceStatusEnum.Unpaired;

            var smartScaleResult = SmartScale.Load(
                entity.RowKey,
                entity.SerialNumber,
                entity.HardwareId,
                entity.DeviceToken,
                type,
                entity.LatestReading,
                entity.TimeOfLastReading
            );

            if (smartScaleResult.IsFailure)
                return null;

            return smartScaleResult.Value;
        }
    }
}
