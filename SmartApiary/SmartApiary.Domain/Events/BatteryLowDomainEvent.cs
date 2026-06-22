using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Events
{
    public sealed record BatteryLowDomainEvent : IDomainEvent
    {
        public EntityId ScaleId { get; init; }
        public DateTime OccurredOn { get; init; }

        public Alert Alert { get; init; }

        public BatteryLowDomainEvent(
            EntityId scaleId,
            string serialNumber,
            string hiveName,
            double batteryLevel,
            DateTime occurredOn
        )
        {
            ScaleId = scaleId;
            OccurredOn = occurredOn;

            var alertResult = Alert.Create(
                scaleId.Value,
                AlertType.Warning,
                $"Battery level is critically low: {batteryLevel}% on hive '{hiveName}' (scale:{serialNumber})."
            );

            Alert = alertResult.Value!;
        }
    }
}
