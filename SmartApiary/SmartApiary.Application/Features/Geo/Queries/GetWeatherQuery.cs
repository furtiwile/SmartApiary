using MediatR;
using SmartApiary.Application.DTOs;
using SmartApiary.Application.Interfaces;
using SmartApiary.Domain.Common;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Application.Features.Geo.Queries
{
    public record GetWeatherQuery(double Latitude, double Longitude) : IRequest<Result<WeatherResultDto>>;

    internal class GetWeatherQueryHandler(IWeatherService weatherService) : IRequestHandler<GetWeatherQuery, Result<WeatherResultDto>>
    {
        public async Task<Result<WeatherResultDto>> Handle(GetWeatherQuery request, CancellationToken ct)
        {
            return await weatherService.GetWeatherAsync(request.Latitude, request.Longitude, ct);
        }
    }
}
