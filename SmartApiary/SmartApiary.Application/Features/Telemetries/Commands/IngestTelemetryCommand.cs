using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Messaging;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Telemetries.Commands
{
    public record IngestTelemetryCommand : IRequest<Result>
    {
        public string DeviceToken { get; init; } = string.Empty;
        public string HiveId { get; init; } = string.Empty;
        public DateTime Timestamp { get; init; }
        public double WeightKg { get; init; }
        public double TemperatureC { get; init; }
        public double HumidityPercent { get; init; }
        public double BatteryPercent { get; init; }
    }

    public class IngestTelemetryValidator : AbstractValidator<IngestTelemetryCommand>
    {
        public IngestTelemetryValidator()
        {
            RuleFor(x => x.DeviceToken).NotEmpty();
            RuleFor(x => x.HiveId).NotEmpty();
            RuleFor(x => x.Timestamp).NotEmpty();
            RuleFor(x => x.HumidityPercent).InclusiveBetween(0, 100);
            RuleFor(x => x.BatteryPercent).InclusiveBetween(0, 100);
        }
    }

    internal class IngestTelemetryHandler(
        ISmartScaleRepository smartScaleRepository,
        ITelemetryRepository telemetryRepository,
        ITelemetryQueueService telemetryQueueService)
        : IRequestHandler<IngestTelemetryCommand, Result>
    {
        public async Task<Result> Handle(IngestTelemetryCommand request, CancellationToken ct)
        {
            var smartScale = await smartScaleRepository.GetByDeviceTokenAsync(request.DeviceToken, ct);
            if (smartScale == null)
                return Result.Failure("Invalid device token", ErrorType.NotFound);

            var hiveIdResult = EntityId.Create(request.HiveId);
            if (hiveIdResult.IsFailure)
                return Result.Failure(hiveIdResult.Error!.Message, ErrorType.Validation);

            var telemetryResult = Telemetry.Create(
                smartScale.Id,
                hiveIdResult.Value,
                request.Timestamp,
                request.WeightKg,
                request.TemperatureC,
                request.HumidityPercent,
                request.BatteryPercent
            );

            if (telemetryResult.IsFailure)
                return Result.Failure(telemetryResult.Error!.Message, ErrorType.Validation);

            await telemetryRepository.SaveAsync(telemetryResult.Value, ct);

            await telemetryQueueService.SendTelemetryAsync(telemetryResult.Value, ct);

            smartScale.LatestReading = request.WeightKg;
            smartScale.TimeOfLastReading = request.Timestamp;
            await smartScaleRepository.UpdateAsync(smartScale, ct);

            return Result.Success();
        }
    }
}
