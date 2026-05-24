using MediatR;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.DeviceStatuses.Queries
{
/* TODO: DELETE
    // QUERY DTO
    public record DeviceStatusDto(
        string DeviceId,
        DeviceType DeviceType,
        double CurrentPower,
        double LoadPercentage,
        bool IsOnline,
        bool IsUnderperforming,
        bool IsOverloaded,
        string CurrentFirmwareVersion,
        string? TargetFirmwareVersion,
        UpdateStatus UpdateStatus
    );

    public record GetDeviceStatusesQuery() : IRequest<Result<IEnumerable<DeviceStatusDto>>?>;

    // HANDLER
    internal class GetDeviceStatusesHandler(
        IDeviceStatusQueryRepository deviceStatusQueryRepository,
        IMapper<DeviceStatus, DeviceStatusDto> mapper,
        ILogger<GetDeviceStatusesHandler> logger
    ) : IRequestHandler<GetDeviceStatusesQuery, Result<IEnumerable<DeviceStatusDto>>?>
    {
        public async Task<Result<IEnumerable<DeviceStatusDto>>?> Handle(GetDeviceStatusesQuery request, CancellationToken ct)
        {
            try
            {
                var statuses = await deviceStatusQueryRepository.GetAllAsync(ct);

                var deviceStatuseDTO = statuses.Select(mapper.Map).ToList();

                return Result<IEnumerable<DeviceStatusDto>>.Success(deviceStatuseDTO);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while retreiving devices..");
                return Result<IEnumerable<DeviceStatusDto>>.Failure("Failed to retrieve devices.",
                 ErrorType.Failure);
            }
        }
    }
*/
}
