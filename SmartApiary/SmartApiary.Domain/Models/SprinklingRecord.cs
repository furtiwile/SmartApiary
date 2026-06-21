using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class SprinklingRecord
    {
        public EntityId Id { get; private set; }
        public DateTime ActualStartTime { get; private set; }
        public DateTime ActualEndTime { get; private set; }
        public string PreparationType { get; private set; } = string.Empty;
        public double WindSpeed { get; private set; }
        public double Precipitation { get; private set; }
        public EntityId AnnouncementId { get; private set; }
        public string WeatherCondition { get; private set; } = string.Empty;

        /// <summary>
        /// Creates an instance of the sprinkling record
        /// </summary>
        /// <param name="id"></param>
        /// <param name="actualStartTime"></param>
        /// <param name="actualEndTime"></param>
        /// <param name="preparationType"></param>
        /// <param name="windSpeed"></param>
        /// <param name="precipitation"></param>
        /// <param name="announcementId"></param>
        private SprinklingRecord(
            EntityId id,
            DateTime actualStartTime,
            DateTime actualEndTime,
            string preparationType,
            double windSpeed,
            double precipitation,
            string weatherCondition,
            EntityId announcementId
        )
        {
            Id = id;
            ActualStartTime = actualStartTime;
            ActualEndTime = actualEndTime;
            PreparationType = preparationType;
            WindSpeed = windSpeed;
            Precipitation = precipitation;
            WeatherCondition = weatherCondition;
            AnnouncementId = announcementId;
        }

        /// <summary>
        /// Validates the sprinkling record data and creates the sprinkling record
        /// </summary>
        /// <param name="actualStartTime"></param>
        /// <param name="actualEndTime"></param>
        /// <param name="preparationType"></param>
        /// <param name="windSpeed"></param>
        /// <param name="precipitation"></param>
        /// <param name="announcementId"></param>
        /// <returns>Sprinkling record if all data is valid, error details otherwise</returns>
        public static Result<SprinklingRecord> Create(
            DateTime actualStartTime,
            DateTime actualEndTime,
            string preparationType,
            double windSpeed,
            double precipitation,
            string weatherCondition,
            EntityId announcementId
        )
        {
            if (actualStartTime > actualEndTime)
                return Result<SprinklingRecord>.Failure("Invalid start time");

            if (string.IsNullOrWhiteSpace(preparationType))
                return Result<SprinklingRecord>.Failure("Preparation type is required");

            if (windSpeed < 0)
                return Result<SprinklingRecord>.Failure("Invalid wind speed");

            if (precipitation < 0)
                return Result<SprinklingRecord>.Failure("Invalid precipitation");

            if (announcementId == null || string.IsNullOrWhiteSpace(announcementId))
                return Result<SprinklingRecord>.Failure("Announcement ID is required");

            return Result<SprinklingRecord>.Success(
                new SprinklingRecord(
                    EntityId.New(),
                    actualStartTime,
                    actualEndTime,
                    preparationType,
                    windSpeed,
                    precipitation,
                    weatherCondition,
                    announcementId
                )
            );

        }

        /// <summary>
        /// Loads the existing sprinkling record
        /// </summary>
        /// <param name="id"></param>
        /// <param name="actualStartTime"></param>
        /// <param name="actualEndTime"></param>
        /// <param name="preparationType"></param>
        /// <param name="windSpeed"></param>
        /// <param name="precipitation"></param>
        /// <param name="announcementId"></param>
        /// <returns>Sprinkling record if all parameters are valid, error details otherwise</returns>
        public static Result<SprinklingRecord> Load(
            string id,
            DateTime actualStartTime,
            DateTime actualEndTime,
            string preparationType,
            double windSpeed,
            double precipitation,
            string weatherCondition,
            string announcementId
        )
        {
            var idResult = EntityId.Create(id);
            if (idResult.IsFailure)
                return Result<SprinklingRecord>.Failure("Invalid sprinkling announcement id");

            var announcementIdResult = EntityId.Create(announcementId);
            if (announcementIdResult.IsFailure)
                return Result<SprinklingRecord>.Failure("Invalid announcement id");

            return Result<SprinklingRecord>.Success(
                new SprinklingRecord(
                    idResult.Value,
                    actualStartTime,
                    actualEndTime,
                    preparationType,
                    windSpeed,
                    precipitation,
                    weatherCondition,
                    announcementIdResult.Value
                )
            );
        }

    }
}