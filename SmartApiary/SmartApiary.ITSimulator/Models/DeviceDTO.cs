using SmartApiary.ITSimulator.Enums;

namespace SmartApiary.ITSimulator.Models
{
    public class DeviceDTO
    {
        public string DeviceName { get; set; } = string.Empty;
        public double NominalPower { get; set; }
        public DeviceType DeviceType { get; set; }
        public string Location { get; set; } = string.Empty;
    }
}
