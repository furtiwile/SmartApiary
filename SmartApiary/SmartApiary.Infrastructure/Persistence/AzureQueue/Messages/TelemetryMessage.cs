namespace SmartApiary.Infrastructure.Persistence.AzureQueue.Messages
{
    public class TelemetryMessage
    {
        public string SmartScaleId { get; set; } = string.Empty;
        public string HiveId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public double WeightKg { get; set; }
        public double TemperatureC { get; set; }
        public double HumidityPercent { get; set; }
        public double BatteryPercent { get; set; }
    }
}
