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

                if (weightDrop >= 5.0)
                {
                    var anomalyEvent = new AnomalyDetectedDomainEvent(
                        scaleIdResult.Value,
                        EntityId.New(),
                        previousTelemetry.WeightKg,
                        request.Weight,
                        weightDrop,
                        DateTime.UtcNow
                    );

                    await mediator.Publish(new DomainEventNotification<AnomalyDetectedDomainEvent>(anomalyEvent), ct);
                }
            }

            return Result.Success();
        }
    }
}