using NetTopologySuite.Geometries;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;
using System;
using System.Collections.Generic;

namespace SmartApiary.Domain.Models
{
    /// <summary>
    /// Represents an apiary entity in the database. 
    /// </summary>
    public class Apiary : AggregateRoot
    {
        public EntityId Id { get; private set; }
        public string Name { get; private set; } = string.Empty;

        public Point Location { get; private set; }

        public double Latitude => Location?.Y ?? 0;
        public double Longitude => Location?.X ?? 0;

        public string Description { get; private set; } = string.Empty;
        public string ImageUrl { get; private set; } = string.Empty;
        public string ThumbnailUrl { get; private set; } = string.Empty;
        public EntityId BeekeeperId { get; private set; }

        public ICollection<Hive> Hives { get; private set; } = [];

        /// <summary>
        /// Creates an instance of the apiary
        /// </summary>
        private Apiary(
            EntityId id,
            string name,
            Point location,
            string description,
            string imageUrl,
            string thumbnailUrl,
            EntityId beekeeperId
        )
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
            var location = new Point(longitude, latitude) { SRID = 4326 };

            return Create(EntityId.New(), name, location, description, imageUrl, thumbnailUrl, beekeperId);
        }

        /// <summary>
        /// Creates a new apiary using a caller supplied ID.
        /// </summary>
        public static Result<Apiary> Create(
            EntityId id,
            string name,
            Point location,
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

            if (string.IsNullOrWhiteSpace(id.Value))
                return Result<Apiary>.Failure("Apiary ID is required");

            if (location == null)
                return Result<Apiary>.Failure("Location is required");

            return Result<Apiary>.Success(
                new Apiary(
                    id,
                    name,
                    location,
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

            var location = new Point(longitude, latitude) { SRID = 4326 };

            return Result<Apiary>.Success(
                new Apiary(
                    idResult.Value,
                    name,
                    location,
                    description,
                    imageUrl,
                    thumbnailUrl,
                    beekeeperIdResult.Value
                )
            );
        }

        public void Update(string name, Point location, string description, string imageUrl, string thumbnailUrl)
        {
            Name = name;
            Location = location;
            Description = description;
            ImageUrl = imageUrl;
            ThumbnailUrl = thumbnailUrl;
        }
    }
}