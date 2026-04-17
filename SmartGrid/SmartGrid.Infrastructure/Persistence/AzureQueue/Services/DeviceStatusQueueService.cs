using Azure.Storage.Queues;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Messaging;
using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Common.Options;
using SmartGrid.Infrastructure.Persistence.AzureQueue.Messages;

namespace SmartGrid.Infrastructure.Persistence.AzureQueue.Services
{
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
            // TODO
            throw new NotImplementedException();
        }

        public async Task SendStatusUpdateAsync(DeviceStatus status, CancellationToken ct = default)
        {
            // TODO
            throw new NotImplementedException();
        }
    }
}
