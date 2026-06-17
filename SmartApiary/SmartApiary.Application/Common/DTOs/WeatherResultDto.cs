namespace SmartApiary.Application.DTOs
{
   public record WeatherResultDto
    {
        public double WindSpeed { get; init; }
        public double Precipitation { get; init; }
        public string Description { get; init; } = string.Empty;
    }
}