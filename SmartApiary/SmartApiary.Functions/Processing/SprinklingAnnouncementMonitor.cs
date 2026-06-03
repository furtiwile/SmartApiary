using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SmartApiary.Application.Features.SprinklingAnnouncements.Commands;
using System.Threading.Tasks;

namespace SmartApiary.Functions.Processing
{
    internal sealed class SprinklingAnnouncementMonitor(
        ILogger<SprinklingAnnouncementMonitor> logger,
        IMediator mediator)
    {
        [Function(nameof(SprinklingAnnouncementMonitor))]
        public async Task RunAsync([TimerTrigger("%SprinklingMonitorSchedule%")] TimerInfo myTimer)
        {
            logger.LogInformation("[TIMER] Executing automated sprinkling announcement monitoring cycle...");

            var result = await mediator.Send(new ProcessExpiredAnnouncementsCommand());

            if (result.IsFailure)
            {
                logger.LogError("[TIMER] Automated background sprinkling verification loop failed: {Error}",
                    result.Error?.Message);
            }
            else
            {
                logger.LogInformation("[TIMER] Automated background sprinkling verification loop executed successfully.");
            }
        }
    }
}