using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi;
using SmartApiary.Application;
using SmartApiary.Infrastructure;
using System.Text.Json.Serialization;

namespace SmartApiary.WebApi.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddWebApiServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Add infrastructure & application layers
            services.AddInfrastructure(configuration)
                    .AddApplication();

            // Controllers + JSON enums
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

            services.Configure<ApiBehaviorOptions>(options =>
            {
                options.SuppressModelStateInvalidFilter = true;
            });

            // Swagger
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "SmartApiary API",
                    Version = "v1",
                    Description = "API for SmartApiary Web Application"
                });
            });

            return services;
        }

        public static IServiceCollection AddWebApiCors(this IServiceCollection services, string reactOrigin)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("_reactAppPolicy", policy =>
                {
                    policy.WithOrigins(reactOrigin)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });
            return services;
        }

        public static IServiceCollection AddWebApiSignalR(this IServiceCollection services)
        {
            services.AddSignalR()
                .AddJsonProtocol(options =>
                {
                    options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

            return services;
        }

        public static IServiceCollection AddWebApiHostedServices(this IServiceCollection services)
        {
            /// TODO: remove
            ///services.AddHostedService<DeviceStatusWorker>();
            return services;
        }
    }
}
