namespace SmartApiary.Infrastructure.Persistence.AzureTable.Entities
{
    internal class SprinklingAnnouncementEntity : BaseTableEntity
    {
        public DateTime StartTime { get; set; }
        public double ExpectedDurationHours { get; set; } = default;
        public string PreparationType { get; set; } = default!;
        public bool IsCancelled { get; set; } = false;
        public string ParcelId { get; set; } = default!;
        public int NotifiedBeekeepersCount { get; set; } = 0;
    }
}
