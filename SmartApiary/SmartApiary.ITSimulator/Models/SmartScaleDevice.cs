namespace SmartApiary.ITSimulator.Models
{
    public class SmartScaleDevice
    {
        public string SerialNumber { get; set; } = string.Empty;
        public string HardwareId { get; set; } = string.Empty;
        public string DeviceToken { get; set; } = string.Empty;
        public string ApiaryId { get; set; } = string.Empty;
        public string HiveId { get; set; } = string.Empty;
        public DateTime? PairedAt { get; set; }
    }
}
