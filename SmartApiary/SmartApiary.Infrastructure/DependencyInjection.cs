using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartApiary.Application.Common.Options;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Extensions;

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

            var tableConn = configuration.GetValue<string>("AzureTableOptions:ConnectionString")
                ?? throw new InvalidOperationException("AzureTableOptions:ConnectionString is not configured.");

            var blobConn = configuration.GetValue<string>("AzureBlobOptions:ConnectionString")
                ?? throw new InvalidOperationException("AzureBlobOptions:ConnectionString is not configured.");

            var queueConn = configuration.GetValue<string>("AzureQueueOptions:ConnectionString")
                ?? throw new InvalidOperationException("AzureQueueOptions:ConnectionString is not configured.");

            services.AddJsonSerializer();

            services
                .AddServices()
                .AddAzureTables(tableConn)
                .AddAzureBlobs(blobConn)
                .AddAzureQueues(queueConn);

            return services; 
        }
    }
}
