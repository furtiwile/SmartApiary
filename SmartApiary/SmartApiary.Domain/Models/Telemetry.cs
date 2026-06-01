using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class Telemetry : AggregateRoot
    {
        public EntityId Id { get; set; }
        public EntityId SmartScaleId { get; set; }
        public EntityId HiveId { get; set; }
        public DateTime Timestamp { get; set; }
        public double WeightKg { get; set; }
        public double TemperatureC { get; set; }
        public double HumidityPercent { get; set; }
        public double BatteryPercent { get; set; }

        private Telemetry(
            EntityId id,
            EntityId smartScaleId,
            EntityId hiveId,
            DateTime timestamp,
            double weightKg,
            double temperatureC,
            double humidityPercent,
            double batteryPercent)
        {
            Id = id;
            SmartScaleId = smartScaleId;
            HiveId = hiveId;
            Timestamp = timestamp;
            WeightKg = weightKg;
            TemperatureC = temperatureC;
            HumidityPercent = humidityPercent;
            BatteryPercent = batteryPercent;
        }

        public static Result<Telemetry> Create(
            EntityId smartScaleId,
            EntityId hiveId,
            DateTime timestamp,
            double weightKg,
            double temperatureC,
            double humidityPercent,
            double batteryPercent)
        {
            if (smartScaleId == null || string.IsNullOrWhiteSpace(smartScaleId.Value))
                return Result<Telemetry>.Failure("Smart scale ID is required", ErrorType.Validation);

            if (hiveId == null || string.IsNullOrWhiteSpace(hiveId.Value))
                return Result<Telemetry>.Failure("Hive ID is required", ErrorType.Validation);

            if (timestamp > DateTime.UtcNow)
                return Result<Telemetry>.Failure("Timestamp cannot be in the future", ErrorType.Validation);

            if (weightKg < 0)
                return Result<Telemetry>.Failure("Weight must be non-negative", ErrorType.Validation);

            if (humidityPercent < 0 || humidityPercent > 100)
                return Result<Telemetry>.Failure("Humidity must be between 0 and 100", ErrorType.Validation);

            if (batteryPercent < 0 || batteryPercent > 100)
                return Result<Telemetry>.Failure("Battery must be between 0 and 100", ErrorType.Validation);

            return Result<Telemetry>.Success(
                new Telemetry(
                    EntityId.New(),
                    smartScaleId,
                    hiveId,
                    timestamp,
                    weightKg,
                    temperatureC,
                    humidityPercent,
                    batteryPercent));
        }

        public static Result<Telemetry> Load(
            string id,
            string smartScaleId,
            string hiveId,
            DateTime timestamp,
            double weightKg,
            double temperatureC,
            double humidityPercent,
            double batteryPercent)
        {
            var idResult = EntityId.Create(id);
            if (idResult.IsFailure)
                return Result<Telemetry>.Failure("Invalid telemetry id", ErrorType.Validation);

            var smartScaleIdResult = EntityId.Create(smartScaleId);
            if (smartScaleIdResult.IsFailure)
                return Result<Telemetry>.Failure("Invalid smart scale id", ErrorType.Validation);

            var hiveIdResult = EntityId.Create(hiveId);
            if (hiveIdResult.IsFailure)
                return Result<Telemetry>.Failure("Invalid hive id", ErrorType.Validation);

            return Result<Telemetry>.Success(
                new Telemetry(
                    idResult.Value,
                    smartScaleIdResult.Value,
                    hiveIdResult.Value,
                    timestamp,
                    weightKg,
                    temperatureC,
                    humidityPercent,
                    batteryPercent));
        }
    }
}
