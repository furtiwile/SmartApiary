using NetTopologySuite.Geometries;

namespace SmartGrid.Domain.Models
{
    ///<summary>
    /// Represents an apiary entity in the database. 
    /// Apiary → Pcelinjak
    /// </summary>
    public class Apiary
    {
        /// <summary>
        ///  hi
        /// </summary>
        /// <param name="id"></param>
        /// <param name="name"></param>
        /// <param name="location"></param>
        /// <param name="description"></param>
        /// <param name="imageUrl"></param>
        /// <param name="thumbnailUrl"></param>
        /// <param name="beekeeperId"></param>
        /// <param name="beekeeper"></param>
        public Apiary(Guid id, string name, Point location, string description, string imageUrl, string thumbnailUrl, Guid beekeeperId, UserEntity beekeeper)
        {
            Id = id;
            Name = name;
            Location = location;
            Description = description;
            ImageUrl = imageUrl;
            ThumbnailUrl = thumbnailUrl;
            BeekeeperId = beekeeperId;
            Beekeeper = beekeeper;
        }

        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Point Location { get; set; }
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public Guid BeekeeperId { get; set; }
        public User Beekeeper { get; set; }
        public ICollection<Hive> Hives { get; set; } = new List<Hive>();



    }
}