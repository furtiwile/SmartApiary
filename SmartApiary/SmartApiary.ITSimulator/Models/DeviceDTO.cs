namespace SmartApiary.ITSimulator.Models
{
    public class DeviceDTO
    {
        public string DeviceName { get; set; } = string.Empty;
        public double NominalPower { get; set; }
        public string DeviceType { get; set; } = "SmartScale";
        public string Location { get; set; } = string.Empty;
    }
}
