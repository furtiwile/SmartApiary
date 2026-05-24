using SmartApiary.Application.Interfaces;
using System.Text.Json;


namespace SmartApiary.Infrastructure.Services
{
    internal class SystemTextJsonSerializer(JsonSerializerOptions options) : IJsonSerializer
    {
        public T? Deserialize<T>(string json)
        {
            return JsonSerializer.Deserialize<T>(json, options);
        }

        public string Serialize<T>(T obj)
        {
            return JsonSerializer.Serialize(obj, options);
        }
    }
}
