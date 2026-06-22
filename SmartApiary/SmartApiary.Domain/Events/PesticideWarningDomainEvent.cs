using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Events
{
    public sealed record PesticideWarningDomainEvent : IDomainEvent
    {
        public EntityId ApiaryId { get; init; }
        public DateTime OccurredOn { get; init; }

        public Alert Alert { get; init; }

        public PesticideWarningDomainEvent(
            EntityId apiaryId,
            string apiaryName,
            DateTime occurredOn
        )
        {
            ApiaryId = apiaryId;
            OccurredOn = occurredOn;

            var alertResult = Alert.Create(
                apiaryId.Value, // We can just use the ApiaryId string here
                AlertType.PesticideWarning,
                $"A spraying announcement was issued near apiary \"{apiaryName}\"."
            );

            Alert = alertResult.Value!;
        }
    }
}
