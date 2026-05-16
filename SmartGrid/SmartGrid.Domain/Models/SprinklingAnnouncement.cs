
namespace SmartGrid.Domain.Models
{
    public class SprinklingAnnouncement
    {
        public Guid Id { get; set; }
        public Guid ParcelId { get; set; }
        public DateTime StartTime { get; set; }
        public double ExpectedDurationHours { get; set; }
        // <summary>
        /// Type of preparation used for sprinkling, should be nullable, as it is not required
        /// </summary>
        public string PreparationType { get; set; } = string.Empty;
        public bool IsCancelled { get; set; }

        public Parcel Parcel { get; set; }
        public ICollection<SprinklingRecord> Records { get; set; } = new List<SprinklingRecord>();
    }
}