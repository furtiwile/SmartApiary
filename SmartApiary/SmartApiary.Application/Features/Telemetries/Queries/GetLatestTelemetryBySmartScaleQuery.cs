using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Telemetries.Queries
{
    public record GetLatestTelemetryBySmartScaleQuery(string SmartScaleId) : IRequest<Result<TelemetryDto>>;

    internal class GetLatestTelemetryBySmartScaleHandler(ITelemetryRepository telemetryRepository)
        : IRequestHandler<GetLatestTelemetryBySmartScaleQuery, Result<TelemetryDto>>
    {
        public async Task<Result<TelemetryDto>> Handle(GetLatestTelemetryBySmartScaleQuery request, CancellationToken ct)
        {
            var smartScaleIdResult = EntityId.Create(request.SmartScaleId);
            if (smartScaleIdResult.IsFailure)
                return Result<TelemetryDto>.Failure(smartScaleIdResult.Error!.Message, ErrorType.Validation);

            var item = await telemetryRepository.GetLatestBySmartScaleIdAsync(smartScaleIdResult.Value, ct);
            if (item == null)
                return Result<TelemetryDto>.Failure("Telemetry not found", ErrorType.NotFound);

            var dto = new TelemetryDto(
                item.Id.Value,
                item.SmartScaleId.Value,
                item.HiveId.Value,
                item.Timestamp,
                item.WeightKg,
                item.TemperatureC,
                item.HumidityPercent,
                item.BatteryPercent);

            return Result<TelemetryDto>.Success(dto);
        }
    }
}
