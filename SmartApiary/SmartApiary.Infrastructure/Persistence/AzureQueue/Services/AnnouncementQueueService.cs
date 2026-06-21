using Azure.Storage.Queues;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Domain.Enums;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Persistence.AzureQueue.Messages;

namespace SmartApiary.Infrastructure.Persistence.AzureQueue.Services
{
    internal class AnnouncementQueueService(
        QueueServiceClient queueServiceClient,
        IJsonSerializer serializer,
        IOptions<AzureQueueOptions> options,
        ILogger<AnnouncementQueueService> logger
    ) : AzureQueueService<AnnouncementMessage>(
        queueServiceClient.GetQueueClient(options.Value.AnnouncementQueue),
        serializer,
        logger
    ), IAnnouncementQueueService
    {
        public async Task SendAnnouncementMessageAsync(string announcementId, AnnouncementAction actionType, CancellationToken ct = default)
        {
            var msg = new AnnouncementMessage
            {
                AnnouncementId = announcementId,
                ActionType = actionType
            };

            await SendMessageAsync(msg, ct);
        }
    }
}
