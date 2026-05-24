using Microsoft.Extensions.DependencyInjection;
using SmartApiary.Application.Interfaces;
using SmartApiary.Infrastructure.Services;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartApiary.Infrastructure.Extensions
{
    internal static class JsonSerializerExtensions
    {
        public static IServiceCollection AddJsonSerializer(this IServiceCollection services)
        {
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };

            jsonOptions.Converters.Add(new JsonStringEnumConverter());

            services.AddSingleton(jsonOptions);

            services.AddSingleton<IJsonSerializer, SystemTextJsonSerializer>();

            return services;
        }
    }
}
