using MediatR;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Features.DeviceStatuses.Commands;
/* TODO: DELETE
// COMMAND - Empty
public record ExecuteMonitoringCommand : IRequest<Result>;

// HANDLER
internal class ExecuteMonitoringHandler(
    IDeviceRepository deviceRepository,
    IDomainEventDispatcher dispatcher,
    IDeviceStatusQueueService deviceStatusQueueService,
    IParallelSettingsProvider parallelSettings,
    ILogger<ExecuteMonitoringHandler> logger,
    IDateTimeProvider dateTimeProvider
    ) : IRequestHandler<ExecuteMonitoringCommand, Result>
{
    public async Task<Result> Handle(ExecuteMonitoringCommand request, CancellationToken ct)
    {
        try
        {
            var devices = deviceRepository.GetAllWithStatusStreamingAsync(ct);

            var options = new ParallelOptions
            {
                MaxDegreeOfParallelism = parallelSettings.MaxDegreeOfParallelism,
                CancellationToken = ct
            };

            await Parallel.ForEachAsync(devices, options, async (device, token) =>
            {
                try
                {
                    await deviceStatusQueueService.SendStatusUpdateAsync(device.Status, token);

                    device.EvaluateMonitoring(dateTimeProvider.UtcNow);

                    if (device.DomainEvents.Count != 0)
                    {
                        await dispatcher.DispatchAsync(device.DomainEvents, token);
                        device.ClearDomainEvents();
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "[MONITORING] Failed processing for Device {Id}", device.Id.Value);
                }
            });

            return Result.Success();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Monitoring cycle failed due to an unexpected error.");
            return Result.Failure("Critical monitoring failure.", ErrorType.Failure);
        }
    }
}
*/