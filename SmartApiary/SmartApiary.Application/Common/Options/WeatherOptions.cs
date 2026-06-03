namespace SmartApiary.Infrastructure.Common.Options
{
    /// <summary>
    /// </summary>
    public class WeatherOptions
    {
        public string ApiKey { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://api.openweathermap.org/data/2.5/";
    }
}