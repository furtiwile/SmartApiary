using Azure.Data.Tables;
using Azure.Storage.Blobs;
using Azure.Storage.Queues;
using Microsoft.Extensions.DependencyInjection;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Storage;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureBlob.Storages;
using SmartApiary.Infrastructure.Persistence.AzureQueue.Services;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;
using SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders;
using SmartApiary.Infrastructure.Persistence.AzureTable.Mappers;
using SmartApiary.Infrastructure.Persistence.AzureTable.Repositories;

namespace SmartApiary.Infrastructure.Extensions
{
    internal static class AzureStorageExtensions
    {
        public static IServiceCollection AddAzureTables(
            this IServiceCollection services,
            string connectionString)
        {
            // Table Service Client
            services.AddSingleton(new TableServiceClient(connectionString));

            // Mappers
            /* TODO: replace mappers
            services.AddSingleton<ITableMapper<Telemetry, TelemetryEntity>, TelemetryTableMapper>();
            services.AddSingleton<ITableMapper<Device, DeviceEntity>, DeviceTableMapper>();
            services.AddSingleton<ITableMapper<DeviceStatus, DeviceStatusEntity>, DeviceStatusTableMapper>();
            services.AddSingleton<ITableMapper<Firmware, FirmwareEntity>, FirmwareTableMapper>();
            */

            // Key Providers
            /* TODO: replace key providers
            services.AddSingleton<ITableKeyProvider<Telemetry>, TelemetryTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<Device>, DeviceTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<DeviceStatus>, DeviceStatusTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<Firmware>, FirmwareTableKeyProvider>();
            */
            // Repositories
            /* TODO: replace repositories
            services.AddScoped<ITelemetryRepository, TelemetryRepository>();
            services.AddScoped<IDeviceRepository, DeviceRepository>();
            services.AddScoped<IFirmwareRepository, FirmwareRepository>();
            services.AddScoped<IDeviceStatusQueryRepository, DeviceStatusQueryRepository>();
            */

            return services;
        }
        public static IServiceCollection AddAzureBlobs(
            this IServiceCollection services,
            string connectionString)
        {
            services.AddSingleton(sp => new BlobServiceClient(connectionString));

            services.AddScoped<IFirmwareBlobStorage, FirmwareBlobStorage>();

            return services;
        }
        public static IServiceCollection AddAzureQueues(
            this IServiceCollection services,
            string connectionString)
        {
            services.AddSingleton(sp =>
            {
                return new QueueServiceClient(connectionString, new QueueClientOptions
                {
                    MessageEncoding = QueueMessageEncoding.Base64
                });
            });

            services.AddScoped<IAlertQueueService, AlertQueueService>();
            // TODO: remove
            //services.AddScoped<IDeviceStatusQueueService, DeviceStatusQueueService>();

            return services;
        }
    }
}
