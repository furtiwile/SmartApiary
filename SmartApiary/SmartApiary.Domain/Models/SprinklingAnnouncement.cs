using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class SprinklingAnnouncement : AggregateRoot
    {
        public EntityId Id { get; private set; }
        public DateTime StartTime { get; private set; }
        public double ExpectedDurationHours { get; private set; }
        /// <summary>
        /// Type of preparation used for sprinkling, should be nullable, as it is not required
        /// </summary>
        public string PreparationType { get; private set; } = string.Empty;
        public bool IsCancelled { get; private set; }
        public EntityId ParcelId { get; private set; }
        /// <summary>
        /// Number of beekeepers notified after the announcement was processed via the queue.
        /// Updated by ProcessSprinklingAnnouncementCommandHandler after emails are sent.
        /// </summary>
        public int NotifiedBeekeepersCount { get; private set; }

        public ICollection<SprinklingRecord> Records { get; private set; } = [];

        private SprinklingAnnouncement(
            EntityId id,
            DateTime startTime,
            double expectedDurationHours,
            string preparationType,
            bool isCancelled,
            EntityId parcelId,
            int notifiedBeekeepersCount = 0
        )
        {
            Id = id;
            StartTime = startTime;
            ExpectedDurationHours = expectedDurationHours;
            PreparationType = preparationType;
            IsCancelled = isCancelled;
            ParcelId = parcelId;
            NotifiedBeekeepersCount = notifiedBeekeepersCount;
        }

        /// <summary>
        /// Validates and creates a new sprinkling announcement.
        /// </summary>
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
                return Result<SprinklingAnnouncement>.Failure("Parcel ID is required");

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

        /// <summary>
        /// Loads an existing sprinkling announcement from storage.
        /// </summary>
        public static Result<SprinklingAnnouncement> Load(
            string id,
            DateTime startTime,
            double expectedDurationHours,
            string preparationType,
            bool isCancelled,
            string parcelId,
            int notifiedBeekeepersCount = 0
        )
        {
            var idResult = EntityId.Create(id);
            if (idResult.IsFailure)
                return Result<SprinklingAnnouncement>.Failure("Invalid sprinkling announcement id");

            var parcelIdResult = EntityId.Create(parcelId);
            if (parcelIdResult.IsFailure)
                return Result<SprinklingAnnouncement>.Failure("Invalid parcel id");

            return Result<SprinklingAnnouncement>.Success(
                new SprinklingAnnouncement(
                    idResult.Value,
                    startTime,
                    expectedDurationHours,
                    preparationType,
                    isCancelled,
                    parcelIdResult.Value,
                    notifiedBeekeepersCount
                )
            );
        }

        public void Cancel()
        {
            IsCancelled = true;
        }

        public void Reschedule(DateTime startTime, double expectedDurationHours, string preparationType)
        {
            StartTime = startTime;
            ExpectedDurationHours = expectedDurationHours;
            PreparationType = preparationType;
            IsCancelled = false;
        }

        /// <summary>
        /// Updates the count of beekeepers notified about this announcement.
        /// </summary>
        public void SetNotifiedCount(int count)
        {
            NotifiedBeekeepersCount = count;
        }
    }
}