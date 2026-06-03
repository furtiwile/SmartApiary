using SmartApiary.Application.DTOs;
using SmartApiary.Domain.Common;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Application.Interfaces
{
    public interface IWeatherService
    {
        Task<Result<WeatherResultDto>> GetWeatherAsync(double latitude, double longitude, CancellationToken ct = default);
    }
}