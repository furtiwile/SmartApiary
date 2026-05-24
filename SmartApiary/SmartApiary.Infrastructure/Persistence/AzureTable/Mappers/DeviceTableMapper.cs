using SmartApiary.Application.Interfaces;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
/* TODO: DELETE
    internal sealed class DeviceTableMapper(IDateTimeProvider dateTimeProvider) : ITableMapper<Device, DeviceEntity>
    {
        public DeviceEntity ToEntity(Device domain)
        {
            return new DeviceEntity
            {
                Name = domain.Name,
                Location = domain.Location,
                NominalPower = domain.NominalPower.Value,
                RegisteredAt = domain.RegisteredAt
            };
        }

        public Device? ToDomain(DeviceEntity entity)
        {
            var type = Enum.TryParse<DeviceType>(entity.PartitionKey, out var parsedType)
               ? parsedType
               : DeviceType.Unknown;

            var defaultStatus = DeviceStatus.CreateDefault(
                EntityId.Create(entity.RowKey).Value,
                type,
                dateTimeProvider.UtcNow);

            var deviceResult = Device.Load(
                entity.RowKey,
                type,
                entity.Name,
                entity.NominalPower,
                entity.Location,
                entity.RegisteredAt,
                defaultStatus
            );

            if (deviceResult.IsFailure)
                return null;

            return deviceResult.Value;
        }
    }
*/
}
