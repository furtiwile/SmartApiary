using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.SmartScales.Commands
{
    public record UnpairSmartScaleCommand(string HiveId) : IRequest<Result>;

    public class UnpairSmartScaleValidator : AbstractValidator<UnpairSmartScaleCommand>
    {
        public UnpairSmartScaleValidator()
        {
            RuleFor(x => x.HiveId).NotEmpty();
        }
    }

    internal class UnpairSmartScaleHandler(
        ISmartScaleRepository smartScaleRepository,
        IHiveRepository hiveRepository)
        : IRequestHandler<UnpairSmartScaleCommand, Result>
    {
        public async Task<Result> Handle(UnpairSmartScaleCommand request, CancellationToken ct)
        {
            var hiveIdResult = EntityId.Create(request.HiveId);
            if (hiveIdResult.IsFailure)
                return Result.Failure(hiveIdResult.Error!.Message, ErrorType.Validation);

            var hive = await hiveRepository.GetByIdAsync(hiveIdResult.Value, ct);
            if (hive == null)
                return Result.Failure("Hive not found", ErrorType.NotFound);

            if (hive.SmartScaleId == null || string.IsNullOrWhiteSpace(hive.SmartScaleId.Value))
                return Result.Success(); // Already unpaired

            var smartScale = await smartScaleRepository.GetByIdAsync(hive.SmartScaleId, ct);
            
            // Unpair from hive
            hive.UnpairSmartScale();
            await hiveRepository.UpdateAsync(hive, ct);

            // Update SmartScale status to Unpaired
            if (smartScale != null)
            {
                smartScale.Unpair();
                // Azure Table partitioning requires deleting old status and re-saving
                await smartScaleRepository.DeleteAsync(smartScale, ct);
                await smartScaleRepository.SaveAsync(smartScale, ct);
            }

            return Result.Success();
        }
    }
}
