
using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class SprinklingAnnouncement : AggregateRoot
    {
        public EntityId Id { get; set; }
        public DateTime StartTime { get; set; }
        public double ExpectedDurationHours { get; set; }
        /// <summary>
        /// Type of preparation used for sprinkling, should be nullable, as it is not required
        /// </summary>
        public string PreparationType { get; set; } = string.Empty;
        public bool IsCancelled { get; set; }
        public EntityId ParcelId { get; set; }

        public ICollection<SprinklingRecord> Records { get; set; } = [];

        /// <summary>
        /// Creates an instance of the sprinkling announcement
        /// </summary>
        /// <param name="id"></param>
        /// <param name="startTime"></param>
        /// <param name="expectedDurationHours"></param>
        /// <param name="preparationType"></param>
        /// <param name="isCancelled"></param>
        /// <param name="parcelId"></param>
        private SprinklingAnnouncement(
            EntityId id,
            DateTime startTime,
            double expectedDurationHours,
            string preparationType,
            bool isCancelled,
            EntityId parcelId
        )
        {
            Id = id;
            StartTime = startTime;
            ExpectedDurationHours = expectedDurationHours;
            PreparationType = preparationType;
            IsCancelled = isCancelled;
            ParcelId = parcelId;
        }

        /// <summary>
        /// Validates the sprinkling announcemant data and creates the sprinkling announcement
        /// </summary>
        /// <param name="startTime"></param>
        /// <param name="expectedDurationHours"></param>
        /// <param name="preparationType"></param>
        /// <param name="isCancelled"></param>
        /// <param name="parcelId"></param>
        /// <returns>Sprinkling announcement if all data is valid, error details otherwise</returns>
        public static Result<SprinklingAnnouncement> Create(
            DateTime startTime,
            double expectedDurationHours,
            string preparationType,
            bool isCancelled,
            EntityId parcelId
        )
        {
            if (expectedDurationHours < 0)
                return Result<SprinklingAnnouncement>.Failure("Invalid expected duration hours");

            if (parcelId == null || string.IsNullOrWhiteSpace(parcelId.Value))
                return Result<SprinklingAnnouncement>.Failure("Beekeper's ID is required");

            return Result<SprinklingAnnouncement>.Success(
                new SprinklingAnnouncement(
                    EntityId.New(),
                    startTime,
                    expectedDurationHours,
                    preparationType,
                    isCancelled,
                    parcelId
                )
            );
        }

    }
}