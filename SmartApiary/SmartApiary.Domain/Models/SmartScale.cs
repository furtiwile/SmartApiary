using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class SmartScale : AggregateRoot
    {
        public EntityId Id { get; private set; }
        public string SerialNumber { get; private set; } = string.Empty;
        public string HardwareId { get; private set; } = string.Empty;
        public string DeviceToken { get; private set; } = string.Empty;
        public DeviceStatusEnum Status { get; private set; }

        public void Activate(string hardwareId, string deviceToken)
        {
            HardwareId = hardwareId;
            DeviceToken = deviceToken;
            Status = DeviceStatusEnum.Paired;
        }

        public void UpdateStatus(DeviceStatusEnum status)
        {
            Status = status;
        }

        public void Unpair()
        {
            HardwareId = string.Empty;
            DeviceToken = string.Empty;
            Status = DeviceStatusEnum.Unpaired;
        }

        public void RefreshDeviceToken(string deviceToken)
        {
            DeviceToken = deviceToken;
        }

        // > maybe save a series of listings?
        // > maybe have a whole separate entity for readings, with a timestamp and a value, and a foreign key to the smart scale?
        // > so a seperate table ig?
        // > public List<Tuple<DateTime, double>> Readings { get; private set; } = new List<Tuple<DateTime, double>>();

        // > but for now, just save the latest reading and the timestamp of that reading
        // reply: maybe create model for listings and have ICollection<Listing> rather than tuples
        public double LatestReading { get; private set; }
        public DateTime TimeOfLastReading { get; private set; }
        public bool IsBatteryWarningSent { get; private set; }
        public double WeightDropThreshold { get; private set; } = 10.0;

        public void UpdateReading(double reading, DateTime timestamp)
        {
            LatestReading = reading;
            TimeOfLastReading = timestamp;
        }

        public void UpdateBatteryWarningStatus(bool isSent)
        {
            IsBatteryWarningSent = isSent;
        }

        /// <summary>
        /// Creates an instance of the smart scale
        /// </summary>
        /// <param name="id"></param>
        /// <param name="serialNumber"></param>
        /// <param name="deviceToken"></param>
        /// <param name="status"></param>
        /// <param name="latestReading"></param>
        /// <param name="timeOfLastReading"></param>
        private SmartScale(
            EntityId id,
            string serialNumber,
            string hardwareId,
            string deviceToken,
            DeviceStatusEnum status,
            double latestReading,
            DateTime timeOfLastReading,
            bool isBatteryWarningSent = false,
            double weightDropThreshold = 10.0)
        {
            Id = id;
            SerialNumber = serialNumber;
            HardwareId = hardwareId;
            DeviceToken = deviceToken;
            Status = status;
            LatestReading = latestReading;
            TimeOfLastReading = timeOfLastReading;
            IsBatteryWarningSent = isBatteryWarningSent;
            WeightDropThreshold = weightDropThreshold;
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
            string hardwareId,
            string deviceToken,
            DeviceStatusEnum status,
            double latestReading,
            DateTime timeOfLastReading,
            bool isBatteryWarningSent = false,
            double weightDropThreshold = 10.0
        )
        {
            if (string.IsNullOrWhiteSpace(serialNumber))
                return Result<SmartScale>.Failure("Serial number is required");

            if (string.IsNullOrWhiteSpace(hardwareId))
                return Result<SmartScale>.Failure("Hardware id is required");

            if (string.IsNullOrWhiteSpace(deviceToken))
                return Result<SmartScale>.Failure("Device token is required");

            return Result<SmartScale>.Success(
                new SmartScale(
                    EntityId.New(),
                    serialNumber,
                    hardwareId,
                    deviceToken,
                    status,
                    latestReading,
                    timeOfLastReading,
                    isBatteryWarningSent,
                    weightDropThreshold
                )
            );
        }

        public static Result<SmartScale> CreateUnpaired(string serialNumber)
        {
            if (string.IsNullOrWhiteSpace(serialNumber))
                return Result<SmartScale>.Failure("Serial number is required");

            return Result<SmartScale>.Success(
                new SmartScale(
                    EntityId.New(),
                    serialNumber,
                    string.Empty,
                    string.Empty,
                    DeviceStatusEnum.Unpaired,
                    0,
                    DateTime.MinValue,
                    false,
                    10.0
                )
            );
        }

        public static string GenerateSerialNumber()
        {
            var random = new Random();
            var year = DateTime.UtcNow.Year;
            var randomFive = random.Next(10000, 99999);
            return $"SA-{year}-{randomFive}";
        }

        /// <summary>
        /// Loads the existing smart scale
        /// </summary>
        /// <param name="id"></param>
        /// <param name="serialNumber"></param>
        /// <param name="deviceToken"></param>
        /// <param name="status"></param>
        /// <param name="latestReading"></param>
        /// <param name="timeOfLastReading"></param>
        /// <returns>Smart scale if all parameters are valid, error details otherwise</returns>
        public static Result<SmartScale> Load(
            string id,
            string serialNumber,
            string hardwareId,
            string deviceToken,
            DeviceStatusEnum status,
            double latestReading,
            DateTime timeOfLastReading,
            bool isBatteryWarningSent = false,
            double weightDropThreshold = 10.0
        )
        {
            var idResult = EntityId.Create(id);
            if (idResult.IsFailure)
                return Result<SmartScale>.Failure("Invalid smart scale id");

            return Result<SmartScale>.Success(
                new SmartScale(
                    idResult.Value,
                    serialNumber,
                    hardwareId,
                    deviceToken,
                    status,
                    latestReading,
                    timeOfLastReading,
                    isBatteryWarningSent,
                    weightDropThreshold
                )
            );
        }

    }
}