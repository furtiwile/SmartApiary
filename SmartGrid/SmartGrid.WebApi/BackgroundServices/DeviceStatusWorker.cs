using SmartGrid.Application.Features.DeviceStatuses.Queries;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Messaging;
using SmartGrid.Domain.Models;

namespace SmartGrid.WebApi.BackgroundServices
{
    internal class DeviceStatusWorker(
        IServiceProvider serviceProvider,
        //IHubContext<DeviceHub> hubContext,
        IMapper<DeviceStatus, DeviceStatusDto> deviceStatusMapper,
        ILogger<DeviceStatusWorker> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("[WORKER] Device Status Worker started listening...");

            while (!stoppingToken.IsCancellationRequested)
            {
                bool foundMessage = false;

                try
                {
                    using var scope = serviceProvider.CreateScope();

                    var queueService = scope
                        .ServiceProvider
                        .GetRequiredService<IDeviceStatusQueueService>();


                    // TODO Step 1: Receive message from queeu

                    IReceivedMessage<DeviceStatus>? message = null;

                    if (message != null)
                    {
                        foundMessage = true;
                        var deviceStatus = message.Body;
                        
                        logger.LogInformation("[WORKER] Received update for device: {DeviceId}",
                            deviceStatus.DeviceId);

                        // Step 2: Map message to device status DTO
                        // Step 3: Send status on ReceiveStatusUpdate
                        // Step 4: Call message complete

                        logger
                            .LogInformation("[WORKER] Update broadcasted to clients and message deleted.");
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "[ERROR] Error processing device status queue.");
                }

                if(!foundMessage)
                {
                    await Task.Delay(2000, stoppingToken);
                }
            }
        }
    }
}

