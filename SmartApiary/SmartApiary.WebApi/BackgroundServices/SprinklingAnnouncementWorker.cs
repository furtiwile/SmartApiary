using MediatR;
using SmartApiary.Application.Features.SprinklingAnnouncements.Commands;

namespace SmartApiary.WebApi.BackgroundServices
{
    internal class SprinklingAnnouncementWorker(
        IServiceProvider serviceProvider,
        ILogger<SprinklingAnnouncementWorker> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("[WORKER] Sprinkling Announcement Worker started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = serviceProvider.CreateScope();
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                    var result = await mediator.Send(new ProcessExpiredAnnouncementsCommand(), stoppingToken);

                    if (result.IsFailure)
                    {
                        logger.LogWarning("[WORKER] ProcessExpiredAnnouncementsCommand returned failure: {Error}", result.Error?.Message);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "[ERROR] Error processing expired sprinkling announcements.");
                }

                // Wait 30 seconds before next iteration
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }
    }
}
