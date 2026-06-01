namespace SmartApiary.ITSimulator.Models
{
    public class SmartScaleDto
    {
        public string Id { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool IsActivated { get; set; }
        public string? HiveId { get; set; }
        public string? DeviceToken { get; set; }
    }
}
