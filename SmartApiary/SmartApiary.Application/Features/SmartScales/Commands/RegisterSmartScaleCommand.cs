using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.SmartScales.Commands
{
    public record RegisterSmartScaleCommand : IRequest<Result<string>>
    {
        public string ApiaryId { get; init; } = string.Empty;
        public string HiveId { get; init; } = string.Empty;
        public string SerialNumber { get; init; } = string.Empty;
    }

    public class RegisterSmartScaleValidator : AbstractValidator<RegisterSmartScaleCommand>
    {
        public RegisterSmartScaleValidator()
        {
            RuleFor(x => x.ApiaryId).NotEmpty();
            RuleFor(x => x.HiveId).NotEmpty();
            RuleFor(x => x.SerialNumber)
                .NotEmpty()
                .Matches(@"^SA-\d{4}-\d{5}$")
                .WithMessage("Serial number must match format SA-YYYY-XXXXX.");
        }
    }

    internal class RegisterSmartScaleHandler(
        ISmartScaleRepository smartScaleRepository,
        IHiveRepository hiveRepository)
        : IRequestHandler<RegisterSmartScaleCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(RegisterSmartScaleCommand request, CancellationToken ct)
        {
            var apiaryIdResult = EntityId.Create(request.ApiaryId);
            if (apiaryIdResult.IsFailure)
                return Result<string>.Failure(apiaryIdResult.Error!.Message, ErrorType.Validation);

            var hiveIdResult = EntityId.Create(request.HiveId);
            if (hiveIdResult.IsFailure)
                return Result<string>.Failure(hiveIdResult.Error!.Message, ErrorType.Validation);

            var hive = await hiveRepository.GetByIdAsync(apiaryIdResult.Value, hiveIdResult.Value, ct);
            if (hive == null)
                return Result<string>.Failure("Hive not found", ErrorType.NotFound);

            var existing = await smartScaleRepository.GetBySerialNumberAsync(request.SerialNumber, ct);
            if (existing != null && existing.Status == DeviceStatusEnum.Paired)
                return Result<string>.Failure("Smart scale already registered and paired to another hive", ErrorType.Validation);

            SmartScale smartScale;
            if (existing != null)
            {
                smartScale = existing;
                
                // Ensure this scale isn't already assigned to another hive
                var existingHive = await hiveRepository.GetBySmartScaleIdAsync(smartScale.Id, ct);
                if (existingHive != null && existingHive.Id != hive.Id)
                    return Result<string>.Failure("Smart scale already registered to another hive", ErrorType.Validation);
            }
            else
            {
                var smartScaleResult = SmartScale.CreateUnpaired(request.SerialNumber);
                if (smartScaleResult.IsFailure)
                    return Result<string>.Failure(smartScaleResult.Error!.Message, ErrorType.Validation);
                smartScale = smartScaleResult.Value;
                await smartScaleRepository.SaveAsync(smartScale, ct);
            }

            hive.PairSmartScale(smartScale.Id);
            await hiveRepository.UpdateAsync(hive, ct);

            return Result<string>.Success(smartScale.Id.Value);
        }
    }
}
