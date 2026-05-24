using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class SmartScale : AggregateRoot
    {
        public EntityId Id { get; set; }
        public string SerialNumber { get; set; } = string.Empty;
        public string DeviceToken { get; set; } = string.Empty;
        public DeviceStatusEnum Status { get; set; }

        // > maybe save a series of listings?
        // > maybe have a whole separate entity for readings, with a timestamp and a value, and a foreign key to the smart scale?
        // > so a seperate table ig?
        // > public List<Tuple<DateTime, double>> Readings { get; set; } = new List<Tuple<DateTime, double>>();

        // > but for now, just save the latest reading and the timestamp of that reading
        // reply: maybe create model for listings and have ICollection<Listing> rather than tuples
        public double LatestReading { get; set; }
        public DateTime TimeOfLastReading { get; set; }

        /// <summary>
        /// Creates an instance of the smart scale
        /// </summary>
        /// <param name="id"></param>
        /// <param name="serialNumber"></param>
        /// <param name="deviceToken"></param>
        /// <param name="status"></param>
        /// <param name="latestReading"></param>
        /// <param name="timeOfLastReading"></param>
        private SmartScale(EntityId id, string serialNumber, string deviceToken, DeviceStatusEnum status, double latestReading, DateTime timeOfLastReading)
        {
            Id = id;
            SerialNumber = serialNumber;
            DeviceToken = deviceToken;
            Status = status;
            LatestReading = latestReading;
            TimeOfLastReading = timeOfLastReading;
        }

        /// <summary>
        /// Validates the smart scale data and creates the smart scale
        /// </summary>
        /// <param name="serialNumber"></param>
        /// <param name="deviceToken"></param>
        /// <param name="status"></param>
        /// <param name="latestReading"></param>
        /// <param name="timeOfLastReading"></param>
        /// <returns>Smart scale if all parameters are valid, error details otherwise</returns>
        public static Result<SmartScale> Create(
            string serialNumber,
            string deviceToken,
            DeviceStatusEnum status,
            double latestReading,
            DateTime timeOfLastReading
        )
        {
            if (string.IsNullOrWhiteSpace(serialNumber))
                return Result<SmartScale>.Failure("Serial number is required");

            if (string.IsNullOrWhiteSpace(deviceToken))
                return Result<SmartScale>.Failure("Device token is required");

            return Result<SmartScale>.Success(
                new SmartScale(
                    EntityId.New(),
                    serialNumber,
                    deviceToken,
                    status,
                    latestReading,
                    timeOfLastReading
                )
            );
        }
    }
}