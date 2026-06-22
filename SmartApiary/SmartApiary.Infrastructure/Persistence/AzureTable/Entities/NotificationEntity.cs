using Azure;
using Azure.Data.Tables;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Entities
{
    internal class NotificationEntity : BaseTableEntity
    {
        public string UserId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsPushed { get; set; }
        public bool IsRead { get; set; }
    }
}
