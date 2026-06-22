using FluentValidation;
using MediatR;
using SmartApiary.Application.Common;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Events;
using SmartApiary.Domain.ValueObjects;


namespace SmartApiary.Application.Features.Telemetries.Commands
{
    // COMMAND
    public record ProcessTelemetryCommand : IRequest<Result>
    {
        public string SmartScaleId { get; init; } = string.Empty;
        public double Weight { get; init; }
        public double Temperature { get; init; }
        public double Humidity { get; init; }
        public double BatteryLevel { get; init; }
    }

    // VALIDATOR
    public class ProcessTelemetryValidator : AbstractValidator<ProcessTelemetryCommand>
    {
        public ProcessTelemetryValidator()
        {
            RuleFor(t => t.SmartScaleId).NotEmpty();
            RuleFor(t => t.Weight).GreaterThanOrEqualTo(0);
        }
    }

    // HANDLER
    internal class ProcessTelemetryCommandHandler(
        ITelemetryRepository telemetryRepository,
        ISmartScaleRepository smartScaleRepository,
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        IUserRepository userRepository,
        IMediator mediator // Koristimo IMediator za Publish
    ) : IRequestHandler<ProcessTelemetryCommand, Result>
    {
        public async Task<Result> Handle(ProcessTelemetryCommand request, CancellationToken ct)
        {
            var scaleIdResult = EntityId.Create(request.SmartScaleId);
            if (scaleIdResult.IsFailure)
                return Result.Failure(scaleIdResult.Error!.Message, ErrorType.Validation);

            var scale = await smartScaleRepository.GetByIdAsync(scaleIdResult.Value, ct);
            if (scale == null)
                return Result.Failure("Smart scale not found", ErrorType.NotFound);

            var previousTelemetry = await telemetryRepository.GetPreviousTelemetryAsync(scaleIdResult.Value, ct);

            if (previousTelemetry != null)
            {
                var weightDrop = previousTelemetry.WeightKg - request.Weight;

                var hive = await hiveRepository.GetByIdAsync(previousTelemetry.HiveId, ct);
                string hiveName = hive?.Designation ?? "Unknown Hive";

                double effectiveThreshold = 10.0;
                if (scale.WeightDropThreshold.HasValue)
                {
                    effectiveThreshold = scale.WeightDropThreshold.Value;
                }
                else if (hive != null)
                {
                    var apiary = await apiaryRepository.GetByIdAsync(hive.ApiaryId, ct);
                    if (apiary != null)
                    {
                        var beekeeper = await userRepository.GetUserByIdAsync(apiary.BeekeeperId, ct);
                        if (beekeeper != null)
                        {
                            effectiveThreshold = beekeeper.WeightDropThreshold;
                        }
                    }
                }

                if (weightDrop >= effectiveThreshold)
                {

                    var anomalyEvent = new AnomalyDetectedDomainEvent(
                        scaleIdResult.Value,
                        scale.SerialNumber,
                        hiveName,
                        EntityId.New(),
                        previousTelemetry.WeightKg,
                        request.Weight,
                        weightDrop,
                        DateTime.UtcNow
                    );

                    await mediator.Publish(new DomainEventNotification<AnomalyDetectedDomainEvent>(anomalyEvent), ct);
                }

                // Check for battery transition below 15%
                if (request.BatteryLevel < 15 && previousTelemetry.BatteryPercent >= 15)
                {

                    var batteryEvent = new BatteryLowDomainEvent(
                        scaleIdResult.Value,
                        scale.SerialNumber,
                        hiveName,
                        request.BatteryLevel,
                        DateTime.UtcNow
                    );

                    await mediator.Publish(new DomainEventNotification<BatteryLowDomainEvent>(batteryEvent), ct);
                }
            }

            return Result.Success();
        }
    }
}