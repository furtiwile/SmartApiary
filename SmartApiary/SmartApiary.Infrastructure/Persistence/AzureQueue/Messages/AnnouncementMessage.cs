using System;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Infrastructure.Persistence.AzureQueue.Messages
{
    public class AnnouncementMessage
    {
        public string AnnouncementId { get; set; } = string.Empty;
        public AnnouncementAction ActionType { get; set; }
    }
}
