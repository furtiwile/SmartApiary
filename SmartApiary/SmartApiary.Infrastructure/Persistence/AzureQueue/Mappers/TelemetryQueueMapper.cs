using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Persistence.AzureQueue.Messages;

namespace SmartApiary.Infrastructure.Persistence.AzureQueue.Mappers
{
    public static class TelemetryQueueMapper
    {
        public static TelemetryMessage? ToQueueMessage(this Telemetry model)
        {
            if (model == null) return null;

            return new TelemetryMessage
            {
                SmartScaleId = model.SmartScaleId.Value,
                HiveId = model.HiveId.Value,
                Timestamp = model.Timestamp,
                WeightKg = model.WeightKg,
                TemperatureC = model.TemperatureC,
                HumidityPercent = model.HumidityPercent,
                BatteryPercent = model.BatteryPercent
            };
        }

        public static Telemetry? ToDomainModel(this TelemetryMessage message)
        {
            var smartScaleIdResult = EntityId.Create(message.SmartScaleId);
            if (smartScaleIdResult.IsFailure)
                return null;

            var hiveIdResult = EntityId.Create(message.HiveId);
            if (hiveIdResult.IsFailure)
                return null;

            var telemetryResult = Telemetry.Create(
                smartScaleIdResult.Value,
                hiveIdResult.Value,
                message.Timestamp,
                message.WeightKg,
                message.TemperatureC,
                message.HumidityPercent,
                message.BatteryPercent
            );

            if (telemetryResult.IsFailure)
                return null;

            return telemetryResult.Value;
        }
    }
}
