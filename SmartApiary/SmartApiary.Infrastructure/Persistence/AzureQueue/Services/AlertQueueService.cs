using Azure.Storage.Queues;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Persistence.AzureQueue.Mappers;
using SmartApiary.Infrastructure.Persistence.AzureQueue.Messages;

namespace SmartApiary.Infrastructure.Persistence.AzureQueue.Services
{
    internal class AlertQueueService(
        QueueServiceClient queueServiceClient,
        IJsonSerializer serializer,
        ILogger<AlertQueueService> logger,
        IOptions<AzureQueueOptions> options
    ) : AzureQueueService<AlertMessage>(
              queueServiceClient.GetQueueClient(options.Value.AlertQueue),
              serializer,
              logger),
         IAlertQueueService
    {
        public async Task SendAlertAsync(Alert alert, CancellationToken ct = default)
        {
            var message = alert.ToQueueMessage();

            if (message != null)
            {
                await base.SendMessageAsync(message, ct);
            }
        }
    }
}
