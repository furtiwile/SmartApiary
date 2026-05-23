using NetTopologySuite.Geometries;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Domain.Models
{
    ///<summary>
    /// Represents an apiary entity in the database. 
    /// </summary>
    public class Apiary : AggregateRoot
    {
        public EntityId Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Point Location { get; set; }
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public EntityId BeekeeperId { get; set; }

        public ICollection<Hive> Hives { get; set; } = [];

        /// <summary>
        /// Creates an instance of the apiary
        /// </summary>
        /// <param name="id"></param>
        /// <param name="name"></param>
        /// <param name="location"></param>
        /// <param name="description"></param>
        /// <param name="imageUrl"></param>
        /// <param name="thumbnailUrl"></param>
        /// <param name="beekeeperId"></param>
        private Apiary(EntityId id, string name, Point location, string description, string imageUrl, string thumbnailUrl, EntityId beekeeperId)
        {
            Id = id;
            Name = name;
            Location = location;
            Description = description;
            ImageUrl = imageUrl;
            ThumbnailUrl = thumbnailUrl;
            BeekeeperId = beekeeperId;
        }

        /// <summary>
        /// Validates the apiary data and creates the apiary
        /// </summary>
        /// <param name="name"></param>
        /// <param name="location"></param>
        /// <param name="description"></param>
        /// <param name="imageUrl"></param>
        /// <param name="thumbnailUrl"></param>
        /// <param name="beekeperId"></param>
        /// <returns>Apiary if all parameters are valid, error details otherwise</returns>
        public static Result<Apiary> Create(string name, Point location, string description, string imageUrl, string thumbnailUrl, EntityId beekeperId)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result<Apiary>.Failure("Name is required");
            
            if (location == null)
                return Result<Apiary>.Failure("Location is required");

            if (string.IsNullOrWhiteSpace(description))
                return Result<Apiary>.Failure("Description is required");

            if (string.IsNullOrWhiteSpace(imageUrl))
                return Result<Apiary>.Failure("Image is required");

            if (string.IsNullOrWhiteSpace(thumbnailUrl))
                return Result<Apiary>.Failure("Thumbnail is required");

            if (string.IsNullOrWhiteSpace(beekeperId.Value))
                return Result<Apiary>.Failure("Beekeper's ID is required");

            return Result<Apiary>.Success(
                new Apiary(
                    EntityId.New(),
                    name, 
                    location, 
                    description, 
                    imageUrl, 
                    thumbnailUrl, 
                    beekeperId
                )
            );
        }

    }
}