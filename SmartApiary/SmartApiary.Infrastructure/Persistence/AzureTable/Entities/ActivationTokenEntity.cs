namespace SmartApiary.Infrastructure.Persistence.AzureTable.Entities
{
    internal class ActivationTokenEntity : BaseTableEntity
    {
        public string TokenHash { get; set; } = default!;
        public string UserId { get; set; } = default!;
        public DateTime ExpiresAtUtc { get; set; }
        public DateTime? UsedAtUtc { get; set; }
    }
}
