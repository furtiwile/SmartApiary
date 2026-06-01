using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;
using System.Linq;

namespace SmartApiary.Application.Features.Telemetries.Queries
{
    public record TelemetryDto(
        string Id,
        string SmartScaleId,
        string HiveId,
        DateTime Timestamp,
        double WeightKg,
        double TemperatureC,
        double HumidityPercent,
        double BatteryPercent
    );

    public record GetTelemetryBySmartScaleQuery(string SmartScaleId) : IRequest<Result<IReadOnlyCollection<TelemetryDto>>>;

    internal class GetTelemetryBySmartScaleHandler(ITelemetryRepository telemetryRepository)
        : IRequestHandler<GetTelemetryBySmartScaleQuery, Result<IReadOnlyCollection<TelemetryDto>>>
    {
        public async Task<Result<IReadOnlyCollection<TelemetryDto>>> Handle(GetTelemetryBySmartScaleQuery request, CancellationToken ct)
        {
            var smartScaleIdResult = EntityId.Create(request.SmartScaleId);
            if (smartScaleIdResult.IsFailure)
                return Result<IReadOnlyCollection<TelemetryDto>>.Failure(smartScaleIdResult.Error!.Message, ErrorType.Validation);

            var items = await telemetryRepository.GetBySmartScaleIdAsync(smartScaleIdResult.Value, ct);

            var result = items
                .OrderByDescending(item => item.Timestamp)
                .Select(item => new TelemetryDto(
                    item.Id.Value,
                    item.SmartScaleId.Value,
                    item.HiveId.Value,
                    item.Timestamp,
                    item.WeightKg,
                    item.TemperatureC,
                    item.HumidityPercent,
                    item.BatteryPercent))
                .ToList();

            return Result<IReadOnlyCollection<TelemetryDto>>.Success(result);
        }
    }
}
