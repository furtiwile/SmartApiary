using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Events
{
    public sealed record PesticideWarningCancelledDomainEvent : IDomainEvent
    {
        public EntityId ApiaryId { get; init; }
        public DateTime OccurredOn { get; init; }

        public Alert Alert { get; init; }

        public PesticideWarningCancelledDomainEvent(
            EntityId apiaryId,
            string apiaryName,
            DateTime occurredOn
        )
        {
            ApiaryId = apiaryId;
            OccurredOn = occurredOn;

            var alertResult = Alert.Create(
                apiaryId.Value, // We can just use the ApiaryId string here
                AlertType.PesticideWarningCancelled,
                $"The spraying announcement issued near apiary \"{apiaryName}\" has been cancelled."
            );

            Alert = alertResult.Value!;
        }
    }
}
