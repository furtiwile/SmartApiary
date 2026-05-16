namespace SmartGrid.Domain.Models
{
    public class SprinklingRecord
    {
        public Guid Id { get; set; }
        public Guid AnnouncementId { get; set; }
        public DateTime ActualStartTime { get; set; }
        public DateTime ActualEndTime { get; set; }
        public string PreparationType { get; set; } = string.Empty;
        public double WindSpeed { get; set; }
        public double Precipitation { get; set; }

        public SprinklingAnnouncement Announcement { get; set; }
    }
}