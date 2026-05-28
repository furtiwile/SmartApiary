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
using SmartApiary.Infrastructure.Services;

namespace SmartApiary.Infrastructure.Extensions
{
    internal static class AzureStorageExtensions
    {
        public static IServiceCollection AddAzureTables(
            this IServiceCollection services,
            string connectionString)
        {
            services.AddHttpContextAccessor();

            // Table Service Client
            services.AddSingleton(new TableServiceClient(connectionString));

            // Mappers
            services.AddSingleton<ITableMapper<User, UserEntity>, UserTableMapper>();
            services.AddSingleton<ITableMapper<Apiary, ApiaryEntity>, ApiaryTableMapper>();
            services.AddSingleton<ITableMapper<Crop, CropEntity>, CropTableMapper>();
            services.AddSingleton<ITableMapper<Hive, HiveEntity>, HiveTableMapper>();
            services.AddSingleton<ITableMapper<HiveInspection, HiveInspectionEntity>, HiveInspectionTableMapper>();
            services.AddSingleton<ITableMapper<Parcel, ParcelEntity>, ParcelTableMapper>();
            services.AddSingleton<ITableMapper<SmartScale, SmartScaleEntity>, SmartScaleTableMapper>();
            services.AddSingleton<ITableMapper<SprinklingAnnouncement, SprinklingAnnouncementEntity>, SprinklingAnnouncementTableMapper>();
            services.AddSingleton<ITableMapper<SprinklingRecord, SprinklingRecordEntity>, SprinklingRecordTableMapper>();
            services.AddSingleton<ITableMapper<Telemetry, TelemetryEntity>, TelemetryTableMapper>();
            // Token mappers
            services.AddSingleton<ITableMapper<ActivationToken, ActivationTokenEntity>, ActivationTokenTableMapper>();
            services.AddSingleton<ITableMapper<PasswordResetToken, PasswordResetTokenEntity>, PasswordResetTokenTableMapper>();

            // Key Providers
            services.AddSingleton<ITableKeyProvider<User>, UserTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<Apiary>, ApiaryTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<Crop>, CropTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<Hive>, HiveTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<HiveInspection>, HiveInspectionTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<Parcel>, ParcelTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<SmartScale>, SmartScaleTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<SprinklingAnnouncement>, SprinklingAnnouncementTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<SprinklingRecord>, SprinklingRecordTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<Telemetry>, TelemetryTableKeyProvider>();
            // Token key providers
            services.AddSingleton<ITableKeyProvider<ActivationToken>, ActivationTokenTableKeyProvider>();
            services.AddSingleton<ITableKeyProvider<PasswordResetToken>, PasswordResetTokenTableKeyProvider>();
            
            // Repositories
            services.AddSingleton<IApiaryRepository, ApiaryRepository>();
            services.AddSingleton<IHiveRepository, HiveRepository>();
            services.AddSingleton<IHiveInspectionRepository, HiveInspectionRepository>();
            services.AddSingleton<IParcelRepository, ParcelRepository>();
            services.AddSingleton<ICropRepository, CropRepository>();
            services.AddSingleton<ISmartScaleRepository, SmartScaleRepository>();
            services.AddSingleton<ISprinklingAnnouncementRepository, SprinklingAnnouncementRepository>();
            services.AddSingleton<ISprinklingRecordRepository, SprinklingRecordRepository>();
            services.AddSingleton<ITelemetryRepository, TelemetryRepository>();
            services.AddSingleton<IUserRepository, Persistence.Sql.Repositories.UserRepository>();
            services.AddSingleton<IActivationTokenRepository, ActivationTokenRepository>();
            services.AddSingleton<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
            services.AddHostedService<TokenTablesInitializerHostedService>();

            return services;
        }
        public static IServiceCollection AddAzureBlobs(
            this IServiceCollection services,
            string connectionString)
        {
            services.AddSingleton(sp => new BlobServiceClient(connectionString));

            services.AddScoped<IFirmwareBlobStorage, FirmwareBlobStorage>();
            services.AddScoped<IApiaryImageStorage, ApiaryImageStorage>();

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
            services.AddScoped<ITelemetryQueueService, TelemetryQueueService>();
            // TODO: remove
            //services.AddScoped<IDeviceStatusQueueService, DeviceStatusQueueService>();

            return services;
        }
    }
}
