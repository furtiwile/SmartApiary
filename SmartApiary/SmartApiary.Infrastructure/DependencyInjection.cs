using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Common.Options;
using SmartApiary.Application.Interfaces;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Extensions;
using SmartApiary.Infrastructure.Services;
namespace SmartApiary.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services, 
            IConfiguration configuration)
        {
            services.Configure<AzureTableOptions>(configuration.GetSection("AzureTableOptions"));
            services.Configure<AzureBlobOptions>(configuration.GetSection("AzureBlobOptions"));
            services.Configure<AzureQueueOptions>(configuration.GetSection("AzureQueueOptions"));
            services.Configure<ParallelSettings>(configuration.GetSection("ParallelSettings"));
            services.Configure<JwtOptions>(configuration.GetSection("JwtOptions"));
            services.Configure<EmailOptions>(configuration.GetSection("EmailOptions"));
            services.Configure<UserTokenOptions>(configuration.GetSection("UserTokenOptions"));
            services.Configure<WeatherOptions>(configuration.GetSection("WeatherOptions"));


            var tableConn = configuration.GetValue<string>("AzureTableOptions:ConnectionString")
                ?? throw new InvalidOperationException("AzureTableOptions:ConnectionString is not configured.");

            var blobConn = configuration.GetValue<string>("AzureBlobOptions:ConnectionString")
                ?? throw new InvalidOperationException("AzureBlobOptions:ConnectionString is not configured.");

            var queueConn = configuration.GetValue<string>("AzureQueueOptions:ConnectionString")
                ?? throw new InvalidOperationException("AzureQueueOptions:ConnectionString is not configured.");

            services.AddJsonSerializer();

            services.AddHttpClient<IWeatherService, OpenWeatherMapService>((serviceProvider, client) =>
            {
                var weatherOptions = serviceProvider.GetRequiredService<IOptions<WeatherOptions>>().Value;
                client.BaseAddress = new Uri(weatherOptions.BaseUrl);
                client.Timeout = TimeSpan.FromSeconds(10); 
            });

            services
                .AddServices()
                .AddAzureTables(tableConn)
                .AddAzureBlobs(blobConn)
                .AddAzureQueues(queueConn)
                .AddHostedService<QueueInitializerHostedService>(); 

            return services; 
        }
    }
}
