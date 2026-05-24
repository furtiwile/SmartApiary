using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class SprinklingRecord
    {
        public EntityId Id { get; set; }
        public DateTime ActualStartTime { get; set; }
        public DateTime ActualEndTime { get; set; }
        public string PreparationType { get; set; } = string.Empty;
        public double WindSpeed { get; set; }
        public double Precipitation { get; set; }
        public EntityId AnnouncementId { get; set; }

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
            EntityId announcementId
        )
        {
            Id = id;
            ActualStartTime = actualStartTime;
            ActualEndTime = actualEndTime;
            PreparationType = preparationType;
            WindSpeed = windSpeed;
            Precipitation = precipitation;
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
                    announcementId
                )
            );

        }

    }
}