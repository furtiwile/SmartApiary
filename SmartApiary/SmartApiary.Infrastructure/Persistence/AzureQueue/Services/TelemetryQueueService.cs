using Azure.Storage.Queues;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Persistence.AzureQueue.Mappers;
using SmartApiary.Infrastructure.Persistence.AzureQueue.Messages;

namespace SmartApiary.Infrastructure.Persistence.AzureQueue.Services
{
    internal class TelemetryQueueService(
        QueueServiceClient queueServiceClient,
        IJsonSerializer serializer,
        ILogger<TelemetryQueueService> logger,
        IOptions<AzureQueueOptions> options
    ) : AzureQueueService<TelemetryMessage>(
            queueServiceClient.GetQueueClient(options.Value.TelemetryQueue),
            serializer,
            logger),
        ITelemetryQueueService
    {
        public async Task<IReceivedMessage<Telemetry>?> ReceiveTelemetryAsync(CancellationToken ct = default)
        {
            var queueMessageWrapper = await base.ReceiveMessageAsync(ct);

            if (queueMessageWrapper == null || queueMessageWrapper.Body == null) return null;

            var domainModel = queueMessageWrapper.Body.ToDomainModel();
            if (domainModel == null)
            {
                await queueMessageWrapper.CompleteAsync();
                return null;
            }

            return new TelemetryReceivedMessage(queueMessageWrapper, domainModel);
        }

        public async Task SendTelemetryAsync(Telemetry telemetry, CancellationToken ct = default)
        {
            var messageDto = telemetry.ToQueueMessage();

            if (messageDto == null) return;

            await base.SendMessageAsync(messageDto, ct);
        }

        private sealed class TelemetryReceivedMessage(IReceivedMessage<TelemetryMessage> message, Telemetry body)
            : IReceivedMessage<Telemetry>
        {
            private readonly IReceivedMessage<TelemetryMessage> _message = message;

            public Telemetry Body { get; } = body;

            public Task CompleteAsync() => _message.CompleteAsync();
        }
    }
}
