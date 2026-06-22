namespace SmartApiary.Infrastructure.Persistence.AzureTable.Entities
{
    internal class SmartScaleEntity : BaseTableEntity
    {
        public string SerialNumber { get; set; } = default!;
        public string HardwareId { get; set; } = default!;
        public string DeviceToken { get; set; } = default!;
        public string Status { get; set; } = default!;
        public double LatestReading { get; set; } = default;
        public DateTime TimeOfLastReading { get; set; }
        public bool IsBatteryWarningSent { get; set; }
        public double? WeightDropThreshold { get; set; }
    }
}
