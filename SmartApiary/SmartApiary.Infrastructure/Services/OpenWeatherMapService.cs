using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Infrastructure.Common.Options;
using System.Text.Json;
namespace SmartApiary.Infrastructure.Services
{
    internal sealed class OpenWeatherMapService : IWeatherService
    {
        private readonly HttpClient _httpClient;
        private readonly WeatherOptions _options;
        private readonly ILogger<OpenWeatherMapService> _logger;

        public OpenWeatherMapService(
            HttpClient httpClient,
            IOptions<WeatherOptions> options,
            ILogger<OpenWeatherMapService> logger)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Result<WeatherResultDto>> GetWeatherAsync(double latitude, double longitude, CancellationToken ct = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(_options.ApiKey))
                {
                    _logger.LogError("[WEATHER] OpenWeatherMap API key is missing in configuration.");
                    return Result<WeatherResultDto>.Failure("Weather service is not properly configured.", ErrorType.Failure);
                }

                var url = $"weather?lat={latitude}&lon={longitude}&appid={_options.ApiKey}&units=metric";

                _logger.LogInformation("[WEATHER] Executing Free Plan API request for Lat: {Lat}, Lon: {Lon}", latitude, longitude);

                var response = await _httpClient.GetAsync(url, ct);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("[WEATHER] OpenWeatherMap API returned failure status code: {StatusCode}", response.StatusCode);
                    return Result<WeatherResultDto>.Failure($"External API error status: {response.StatusCode}", ErrorType.Failure);
                }

                var jsonString = await response.Content.ReadAsStringAsync(ct);

                using var document = JsonDocument.Parse(jsonString);
                var root = document.RootElement;

                double windSpeed = 0.0;
                if (root.TryGetProperty("wind", out var windElement) && windElement.TryGetProperty("speed", out var speedProp))
                {
                    windSpeed = speedProp.GetDouble();
                }

                double precipitation = 0.0;
                if (root.TryGetProperty("rain", out var rainElement) && rainElement.TryGetProperty("1h", out var rainValue))
                {
                    precipitation = rainValue.GetDouble();
                }
                else if (root.TryGetProperty("snow", out var snowElement) && snowElement.TryGetProperty("1h", out var snowValue))
                {
                    precipitation = snowValue.GetDouble();
                }

                string description = "Clear";
                if (root.TryGetProperty("weather", out var weatherArray) && weatherArray.GetArrayLength() > 0)
                {
                    description = weatherArray[0].GetProperty("description").GetString() ?? "Clear";
                }

                var weatherDto = new WeatherResultDto
                {
                    WindSpeed = windSpeed,
                    Precipitation = precipitation,
                    Description = description
                };

                return Result<WeatherResultDto>.Success(weatherDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[WEATHER] Critical exception occurred during weather data ingestion.");
                return Result<WeatherResultDto>.Failure($"Weather service unexpected failure: {ex.Message}", ErrorType.Unexpected);
            }
        }
    }
}