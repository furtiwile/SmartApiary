using SmartGrid.Domain.Enums;

namespace SmartGrid.Domain.Models
{
    public class SmartScale
    {
        public Guid Id { get; set; }
        public string SerialNumber { get; set; } = string.Empty;
        public string DeviceToken { get; set; } = string.Empty;
        public DeviceStatusEnum Status { get; set; }
        public Hive Hive { get; set; }

        // maybe save a series of listings?
        // maybe have a whole separate entity for readings, with a timestamp and a value, and a foreign key to the smart scale?
        // so a seperate table ig?
        //public List<Tuple<DateTime, double>> Readings { get; set; } = new List<Tuple<DateTime, double>>();

        // but for now, just save the latest reading and the timestamp of that reading
        public double LatestReading { get; set; }
        public DateTime TimeOfLastReading { get; set; }
    }
}