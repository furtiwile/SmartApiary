using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Events
{
    public sealed class AnomalyDetectedDomainEvent(Alert alert, DateTime occurredOn) : IDomainEvent
    {
        public Alert Alert { get; set; } = alert;
        public DateTime OccurredOn { get; } = occurredOn;
    }
}
