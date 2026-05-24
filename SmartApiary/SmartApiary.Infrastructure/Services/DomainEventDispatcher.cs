using MediatR;
using SmartApiary.Application.Common;
using SmartApiary.Application.Interfaces;
using SmartApiary.Domain.Common;

namespace SmartApiary.Infrastructure.Services
{
    internal class DomainEventDispatcher(IMediator mediator) : IDomainEventDispatcher
    {
        public async Task DispatchAsync(IEnumerable<IDomainEvent> domainEvents, CancellationToken ct = default)
        {
            foreach (var domainEvent in domainEvents)
            {
                var notificationType = typeof(DomainEventNotification<>).MakeGenericType(domainEvent.GetType());
                var notification = Activator.CreateInstance(notificationType, domainEvent) as INotification;

                if (notification is not null)
                {
                    await mediator.Publish(notification, ct);
                }
            }
        }
    }
}
