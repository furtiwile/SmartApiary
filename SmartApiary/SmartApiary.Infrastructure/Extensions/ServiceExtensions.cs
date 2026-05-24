using Microsoft.Extensions.DependencyInjection;
using SmartApiary.Application.Interfaces;
using SmartApiary.Infrastructure.Services;

namespace SmartApiary.Infrastructure.Extensions
{
    internal static class ServiceExtensions
    {
        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

            services.AddScoped<IParallelSettingsProvider, ParallelSettingsProvider>();

            services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();

            return services;
        }
    }
}
