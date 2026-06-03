using Azure.Storage.Queues;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartApiary.Infrastructure.Common.Options;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Infrastructure.Services
{
    internal sealed class QueueInitializerHostedService(
        QueueServiceClient queueServiceClient,
        IOptions<AzureQueueOptions> options,
        ILogger<QueueInitializerHostedService> logger
    ) : IHostedService
    {
        public async Task StartAsync(CancellationToken cancellationToken)
        {
            var queueNames = new[]
            {
                options.Value.TelemetryQueue,
                options.Value.AlertQueue,
                options.Value.DeviceStatusQueue
            };

            foreach (var queueName in queueNames)
            {
                if (!string.IsNullOrWhiteSpace(queueName))
                {
                    var queueClient = queueServiceClient.GetQueueClient(queueName);
                    await queueClient.CreateIfNotExistsAsync(cancellationToken: cancellationToken);
                    logger.LogInformation("Ensured Azure Queue exists: {QueueName}", queueName);
                }
            }
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}