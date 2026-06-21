using MediatR;
using SmartApiary.Domain.Common;

namespace SmartApiary.Application.Common
{
    // This class represents a notification for a domain event. 
    // It implements the INotification interface from MediatR, allowing it to be published and handled by MediatR's notification handlers. 
    // The class is generic and can be used with any type that implements the IDomainEvent interface.
    public sealed class DomainEventNotification<TDomainEvent>(TDomainEvent domainEvent) : INotification
            where TDomainEvent : IDomainEvent
    {
        public TDomainEvent Event { get; } = domainEvent;
    }
}
