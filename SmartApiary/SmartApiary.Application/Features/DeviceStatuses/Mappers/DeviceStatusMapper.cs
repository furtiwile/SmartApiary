using SmartApiary.Application.Features.DeviceStatuses.Queries;
using SmartApiary.Application.Interfaces;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.DeviceStatuses.Mappers
{
/* TODO: DELETE
    internal sealed class DeviceStatusMapper(IDateTimeProvider dateTimeProvider)
        : IMapper<DeviceStatus, DeviceStatusDto>
    {
        public DeviceStatusDto Map(DeviceStatus source)
        {
            var now = dateTimeProvider.UtcNow;

            return new DeviceStatusDto(
                source.DeviceId.ToString(),
                source.DeviceType,
                source.CurrentPower.Value,
                source.LoadPercentage.Value,
                source.IsOnline(now),
                source.IsUnderperforming,
                source.IsOverloaded,
                source.CurrentFirmwareVersion.Value,
                source.TargetFirmwareVersion?.Value,
                source.UpdateStatus
            );
        }
    }
*/
}
