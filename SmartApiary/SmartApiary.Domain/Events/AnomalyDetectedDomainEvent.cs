using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Events
{
    public sealed record AnomalyDetectedDomainEvent : IDomainEvent
    {
        public EntityId ScaleId { get; init; }
        public EntityId BeekeeperId { get; init; }
        public double PreviousWeight { get; init; }
        public double CurrentWeight { get; init; }
        public double WeightDrop { get; init; }
        public DateTime OccurredOn { get; init; }

        public Alert Alert { get; init; }

        public AnomalyDetectedDomainEvent(
            EntityId scaleId,
            string serialNumber,
            string hiveName,
            EntityId beekeeperId,
            double previousWeight,
            double currentWeight,
            double weightDrop,
            DateTime occurredOn
        )
        {
            ScaleId = scaleId;
            BeekeeperId = beekeeperId;
            PreviousWeight = previousWeight;
            CurrentWeight = currentWeight;
            WeightDrop = weightDrop;
            OccurredOn = occurredOn;

            var alertResult = Alert.Create(
                scaleId.Value,
                AlertType.WeightDrop,
                $"Sudden fall of weight on hive '{hiveName}' (scale:{serialNumber})! Previus: {previousWeight} kg, Current: {currentWeight} kg. Possible theft!"
            );

            Alert = alertResult.Value!;
        }
    }
}