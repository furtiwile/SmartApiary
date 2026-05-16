using NetTopologySuite.Geometries;

namespace SmartGrid.Domain.Models
{
    public class Parcel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Point Location { get; set; }
        public Guid FarmerId { get; set; }

        public User Farmer { get; set; }
        public ICollection<Crop> Crops { get; set; } = new List<Crop>();
        public ICollection<SprinklingAnnouncement> Announcements { get; set; } = new List<SprinklingAnnouncement>();
    }
}