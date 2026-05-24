using Azure.Storage.Queues;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Persistence.AzureQueue.Adapters;
using SmartApiary.Infrastructure.Persistence.AzureQueue.Mappers;
using SmartApiary.Infrastructure.Persistence.AzureQueue.Messages;

namespace SmartApiary.Infrastructure.Persistence.AzureQueue.Services
{
/* TODO: DELETE
    internal class DeviceStatusQueueService(
        QueueServiceClient queueServiceClient,
        IJsonSerializer serializer,
        ILogger<DeviceStatusQueueService> logger,
        IOptions<AzureQueueOptions> options
    ) : AzureQueueService<DeviceStatusMessage>(
              queueServiceClient.GetQueueClient(options.Value.DeviceStatusQueue),
              serializer,
              logger),
        IDeviceStatusQueueService
    {
        public async Task<IReceivedMessage<DeviceStatus>?> ReceiveStatusUpdateAsync(CancellationToken ct)
        {
            var queueMessageWrapper = await base.ReceiveMessageAsync(ct);

            if (queueMessageWrapper == null || queueMessageWrapper.Body == null) return null;

            var domainModel = queueMessageWrapper.Body.ToDomainModel();

            if (domainModel == null)
            {
                _logger.LogError("Failed to map message {MessageId} to domain model.", "...");

                await queueMessageWrapper.CompleteAsync();
                return null;
            }

            return new DeviceStatusReceivedMessage(queueMessageWrapper, domainModel);
        }

        public async Task SendStatusUpdateAsync(DeviceStatus status, CancellationToken ct = default)
        {
            var messageDto = status.ToQueueMessage();

            if (messageDto == null) return;

            await base.SendMessageAsync(messageDto, ct);
        }
    }
*/
}
