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
            RuleFor(x => x.SerialNumber).NotEmpty();
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
            if (existing != null)
                return Result<string>.Failure("Smart scale already registered", ErrorType.Validation);

            var smartScaleResult = SmartScale.CreateUnpaired(request.SerialNumber);
            if (smartScaleResult.IsFailure)
                return Result<string>.Failure(smartScaleResult.Error!.Message, ErrorType.Validation);

            await smartScaleRepository.SaveAsync(smartScaleResult.Value, ct);

            hive.SmartScaleId = smartScaleResult.Value.Id;
            await hiveRepository.UpdateAsync(hive, ct);

            return Result<string>.Success(smartScaleResult.Value.Id.Value);
        }
    }
}
