using NetTopologySuite.Geometries;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Domain.Models
{
    public class Parcel : AggregateRoot
    {
        public EntityId Id { get; set; }
        public string Name { get; set; }
        public Point Location { get; set; }
        public EntityId FarmerId { get; set; }

        public ICollection<Crop> Crops { get; set; } = [];
        public ICollection<SprinklingAnnouncement> Announcements { get; set; } = [];

        /// <summary>
        /// Creates an instance of the parcel
        /// </summary>
        /// <param name="id"></param>
        /// <param name="name"></param>
        /// <param name="location"></param>
        /// <param name="farmerId"></param>
        private Parcel(EntityId id, string name, Point location, EntityId farmerId)
        {
            Id = id;
            Name = name;
            Location = location;
            FarmerId = farmerId;
        }

        /// <summary>
        /// Validates the parcel data and creates the parcel
        /// </summary>
        /// <param name="name"></param>
        /// <param name="location"></param>
        /// <param name="farmerId"></param>
        /// <returns>Parcel if all parameters are valid, error details otherwise</returns>
        public static Result<Parcel> Create(string name, Point location, EntityId farmerId)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result<Parcel>.Failure("Name is required");

            if (location == null)
                return Result<Parcel>.Failure("Location is required");

            if (farmerId == null || !string.IsNullOrWhiteSpace(farmerId.Value))
                return Result<Parcel>.Failure("Farmer ID is required");

            return Result<Parcel>.Success(
                new Parcel(
                    EntityId.New(),
                    name,
                    location,
                    farmerId
                )
            );
        }

    }
}