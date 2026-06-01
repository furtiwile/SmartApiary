using Microsoft.AspNetCore.SignalR;
using SmartApiary.Application.Features.Telemetries.Queries;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.WebApi.Hubs;

namespace SmartApiary.WebApi.BackgroundServices
{
    internal class TelemetryBroadcastWorker(
        IServiceProvider serviceProvider,
        IHubContext<DeviceHub> hubContext,
        ILogger<TelemetryBroadcastWorker> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("[WORKER] Telemetry worker started listening...");

            while (!stoppingToken.IsCancellationRequested)
            {
                bool foundMessage = false;

                try
                {
                    using var scope = serviceProvider.CreateScope();

                    var queueService = scope.ServiceProvider.GetRequiredService<ITelemetryQueueService>();
                    var hiveRepository = scope.ServiceProvider.GetRequiredService<IHiveRepository>();

                    var message = await queueService.ReceiveTelemetryAsync(stoppingToken);

                    if (message != null)
                    {
                        foundMessage = true;
                        var telemetry = message.Body;

                        var dto = new TelemetryDto(
                            telemetry.Id.Value,
                            telemetry.SmartScaleId.Value,
                            telemetry.HiveId.Value,
                            telemetry.Timestamp,
                            telemetry.WeightKg,
                            telemetry.TemperatureC,
                            telemetry.HumidityPercent,
                            telemetry.BatteryPercent
                        );

                        await hubContext.Clients.Group($"hive:{telemetry.HiveId.Value}")
                            .SendAsync("ReceiveTelemetry", dto, stoppingToken);

                        var hive = await hiveRepository.GetByIdAsync(telemetry.HiveId, stoppingToken);
                        if (hive != null)
                        {
                            await hubContext.Clients.Group($"apiary:{hive.ApiaryId.Value}")
                                .SendAsync("ReceiveTelemetry", dto, stoppingToken);
                        }

                        await message.CompleteAsync();

                        logger.LogInformation("[WORKER] Telemetry broadcasted for SmartScale: {SmartScaleId}",
                            telemetry.SmartScaleId.Value);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "[ERROR] Error processing telemetry queue.");
                }

                if (!foundMessage)
                {
                    await Task.Delay(2000, stoppingToken);
                }
            }
        }
    }
}
