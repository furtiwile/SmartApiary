using NetTopologySuite.Geometries;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;
using System;
using System.Data;

namespace SmartApiary.Domain.Models
{
    ///<summary>
    /// Represents an apiary entity in the database. 
    /// </summary>
    public class Apiary : AggregateRoot
    {
        public EntityId Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
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
        /// <param name="latitude"></param>
        /// <param name="longitude"></param>
        /// <param name="description"></param>
        /// <param name="imageUrl"></param>
        /// <param name="thumbnailUrl"></param>
        /// <param name="beekeeperId"></param>
        private Apiary(
            EntityId id, 
            string name, 
            double latitude, 
            double longitude, 
            string description, 
            string imageUrl, 
            string thumbnailUrl, 
            EntityId beekeeperId
        )
        {
            Id = id;
            Name = name;
            Latitude = latitude;
            Longitude = longitude;
            Description = description;
            ImageUrl = imageUrl;
            ThumbnailUrl = thumbnailUrl;
            BeekeeperId = beekeeperId;
        }

        /// <summary>
        /// Validates the apiary data and creates the apiary
        /// </summary>
        /// <param name="name"></param>
        /// <param name="latitude"></param>
        /// <param name="longitude"></param>
        /// <param name="description"></param>
        /// <param name="imageUrl"></param>
        /// <param name="thumbnailUrl"></param>
        /// <param name="beekeperId"></param>
        /// <returns>Apiary if all parameters are valid, error details otherwise</returns>
        public static Result<Apiary> Create(
            string name, 
            double latitude, 
            double longitude, 
            string description, 
            string imageUrl, 
            string thumbnailUrl, 
            EntityId beekeperId
        )
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result<Apiary>.Failure("Name is required");
            
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
                    latitude,
                    longitude,
                    description, 
                    imageUrl, 
                    thumbnailUrl, 
                    beekeperId
                )
            );
        }

        /// <summary>
        /// Loads the existing apiary
        /// </summary>
        /// <param name="id"></param>
        /// <param name="name"></param>
        /// <param name="latitude"></param>
        /// <param name="longitude"></param>
        /// <param name="description"></param>
        /// <param name="imageUrl"></param>
        /// <param name="thumbnailUrl"></param>
        /// <param name="beekeperId"></param>
        /// <returns>Apiary if all parameters are valid, error details otherwise</returns>
        public static Result<Apiary> Load(
            string id,
            string name,
            double latitude,
            double longitude,
            string description,
            string imageUrl,
            string thumbnailUrl,
            string beekeperId
        )
        {
            var idResult = EntityId.Create(id);
            if (idResult.IsFailure)
                return Result<Apiary>.Failure("Invalid apiary id");

            var beekeeperIdResult = EntityId.Create(beekeperId);
            if (beekeeperIdResult.IsFailure)
                return Result<Apiary>.Failure("Invalid beekeeper id");

            return Result<Apiary>.Success(
                new Apiary(
                    idResult.Value,
                    name,
                    latitude,
                    longitude,
                    description,
                    imageUrl,
                    thumbnailUrl,
                    beekeeperIdResult.Value
                )
            );
        }

    }
}