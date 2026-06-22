using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Features.SprinklingAnnouncements.Commands;
using SmartApiary.Infrastructure.Persistence.AzureQueue.Messages;

namespace SmartApiary.Functions.Processing
{
    internal sealed class SprinklingAnnouncementMonitor(
        ILogger<SprinklingAnnouncementMonitor> logger,
        IMediator mediator)
    {
        [Function(nameof(SprinklingAnnouncementMonitor))]
        public async Task RunAsync(
            [QueueTrigger("%AzureQueueOptions:AnnouncementQueue%", Connection = "AzureWebJobsStorage")] AnnouncementMessage message)
        {
            try
            {
                logger.LogInformation("[QUEUE] Processing sprinkling announcement message for announcement: {AnnouncementId}, Action: {ActionType}",
                    message.AnnouncementId, message.ActionType);

                var result = await mediator.Send(new ProcessSprinklingAnnouncementCommand(message.AnnouncementId, message.ActionType));

                if (result.IsFailure)
                {
                    logger.LogError("[QUEUE] Sprinkling announcement processing failed: {Error}",
                        result.Error?.Message);
                }
                else
                {
                    logger.LogInformation("[QUEUE] Sprinkling announcement processed successfully.");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[QUEUE] Exception occurred while processing sprinkling announcement message for announcement: {AnnouncementId}", 
                    message?.AnnouncementId);
                throw;
            }
        }
    }
}