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
            services.AddSingleton<IDeviceTokenGenerator, DeviceTokenGenerator>();
            services.AddSingleton<IJwtGenerator, JwtGenerator>();

            // Email & token services
            services.AddSingleton<IOneTimeTokenService, OneTimeTokenService>();
            services.AddSingleton<IEmailLinkProvider, EmailLinkProvider>();
            services.AddSingleton<IEmailSender, SendGridEmailSender>();
            services.AddSingleton<IUserTokenSettings, UserTokenSettings>();

            services.AddScoped<IParallelSettingsProvider, ParallelSettingsProvider>();

            services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();

            return services;
        }
    }
}
