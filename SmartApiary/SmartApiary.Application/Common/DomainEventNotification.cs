using MediatR;
using SmartApiary.Domain.Common;

namespace SmartApiary.Application.Common
{
    public sealed class DomainEventNotification<TDomainEvent>(TDomainEvent domainEvent) : INotification
            where TDomainEvent : IDomainEvent
    {
        public TDomainEvent Event { get; } = domainEvent;
    }
}
