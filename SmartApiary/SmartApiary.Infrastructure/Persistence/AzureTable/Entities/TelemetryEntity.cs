namespace SmartApiary.Infrastructure.Persistence.AzureTable.Entities
{
    internal class TelemetryEntity : BaseTableEntity
    {
        public string SmartScaleId { get; set; } = default!;
        public string HiveId { get; set; } = default!;
        public new DateTime Timestamp { get; set; }
        public double WeightKg { get; set; }
        public double TemperatureC { get; set; }
        public double HumidityPercent { get; set; }
        public double BatteryPercent { get; set; }
    }
}
