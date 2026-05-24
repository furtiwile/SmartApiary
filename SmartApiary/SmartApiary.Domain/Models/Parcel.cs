using NetTopologySuite.Geometries;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class Parcel : AggregateRoot
    {
        public EntityId Id { get; set; }
        public string Name { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public EntityId FarmerId { get; set; }

        public ICollection<Crop> Crops { get; set; } = [];
        public ICollection<SprinklingAnnouncement> Announcements { get; set; } = [];

        /// <summary>
        /// Creates an instance of the parcel
        /// </summary>
        /// <param name="id"></param>
        /// <param name="name"></param>
        /// <param name="latitude"></param>
        /// <param name="longitude"></param>
        /// <param name="farmerId"></param>
        private Parcel(EntityId id, string name, double latitude, double longitude, EntityId farmerId)
        {
            Id = id;
            Name = name;
            Latitude = latitude;
            Longitude = longitude;
            FarmerId = farmerId;
        }

        /// <summary>
        /// Validates the parcel data and creates the parcel
        /// </summary>
        /// <param name="name"></param>
        /// <param name="latitude"></param>
        /// <param name="longitude"></param>
        /// <param name="farmerId"></param>
        /// <returns>Parcel if all parameters are valid, error details otherwise</returns>
        public static Result<Parcel> Create(string name, double latitude, double longitude, EntityId farmerId)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result<Parcel>.Failure("Name is required");

            if (farmerId == null || !string.IsNullOrWhiteSpace(farmerId.Value))
                return Result<Parcel>.Failure("Farmer ID is required");

            return Result<Parcel>.Success(
                new Parcel(
                    EntityId.New(),
                    name,
                    latitude,
                    longitude,
                    farmerId
                )
            );
        }

        /// <summary>
        /// Loads the existing parcel
        /// </summary>
        /// <param name="id"></param>
        /// <param name="name"></param>
        /// <param name="latitude"></param>
        /// <param name="longitude"></param>
        /// <param name="farmerId"></param>
        /// <returns>Parcel if all parameters are valid, error details otherwise</returns>
        public static Result<Parcel> Load(string id, string name, double latitude, double longitude, string farmerId)
        {
            var idResult = EntityId.Create(id);
            if (idResult.IsFailure)
                return Result<Parcel>.Failure("Invalid parcel id");

            var farmerIdResult = EntityId.Create(farmerId);
            if (farmerIdResult.IsFailure)
                return Result<Parcel>.Failure("Invalid farmer id");

            return Result<Parcel>.Success(
                new Parcel(
                    idResult.Value,
                    name,
                    latitude,
                    longitude,
                    farmerIdResult.Value
                )
            );
        }

    }
}