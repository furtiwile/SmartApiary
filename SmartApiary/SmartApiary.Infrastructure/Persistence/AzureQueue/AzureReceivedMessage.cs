using Azure.Storage.Queues;
using SmartApiary.Application.Interfaces.Messaging;

namespace SmartApiary.Infrastructure.Persistence.AzureQueue
{
    internal class AzureReceivedMessage<T>(
        QueueClient queueClient,
        string messageId,
        string receiptHandle,
        T body
    ) : IReceivedMessage<T>
    {
        private readonly QueueClient _queueClient = queueClient;
        private readonly string _messageId = messageId;
        private readonly string _receiptHandle = receiptHandle;

        public T Body { get; } = body;

        public async Task CompleteAsync()
        {
            await _queueClient.DeleteMessageAsync(_messageId, _receiptHandle);
        }
    }
}
