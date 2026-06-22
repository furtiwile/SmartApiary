using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SmartApiary.Application;
using SmartApiary.Infrastructure;
using SmartApiary.WebApi.BackgroundServices;
using System.Text;
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

            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(typeof(ServiceCollectionExtensions).Assembly);
            });

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

            // Authentication
            var jwtSection = configuration.GetSection("JwtOptions");
            var secret = jwtSection.GetValue<string>("Secret");
            if (!string.IsNullOrWhiteSpace(secret))
            {
                services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.SaveToken = true;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSection.GetValue<string>("Issuer"),
                        ValidAudience = jwtSection.GetValue<string>("Audience"),
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
                    };
                });

                services.AddAuthorization();
            }

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
            services.AddHostedService<TelemetryBroadcastWorker>();
            services.AddHostedService<SprinklingAnnouncementWorker>();
            return services;
        }
    }
}
