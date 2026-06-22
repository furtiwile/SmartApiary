using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.SmartScales.Commands
{
    public record UpdateSmartScaleThresholdCommand(string SmartScaleId, double? WeightDropThreshold) : IRequest<Result>;

    public class UpdateSmartScaleThresholdValidator : AbstractValidator<UpdateSmartScaleThresholdCommand>
    {
        public UpdateSmartScaleThresholdValidator()
        {
            RuleFor(x => x.SmartScaleId).NotEmpty();
            RuleFor(x => x.WeightDropThreshold).GreaterThan(0).When(x => x.WeightDropThreshold.HasValue);
        }
    }

    internal class UpdateSmartScaleThresholdHandler(
        ISmartScaleRepository smartScaleRepository,
        ICurrentUserContext currentUser
    ) : IRequestHandler<UpdateSmartScaleThresholdCommand, Result>
    {
        public async Task<Result> Handle(UpdateSmartScaleThresholdCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper)
                return Result.Failure("Unauthorized", ErrorType.Unauthorized);

            var scaleIdResult = EntityId.Create(request.SmartScaleId);
            if (scaleIdResult.IsFailure)
                return Result.Failure(scaleIdResult.Error!.Message, ErrorType.Validation);

            var scale = await smartScaleRepository.GetByIdAsync(scaleIdResult.Value, ct);
            if (scale == null)
                return Result.Failure("Smart scale not found", ErrorType.NotFound);
            
            scale.UpdateWeightDropThreshold(request.WeightDropThreshold);
            await smartScaleRepository.UpdateAsync(scale, ct);

            return Result.Success();
        }
    }
}
