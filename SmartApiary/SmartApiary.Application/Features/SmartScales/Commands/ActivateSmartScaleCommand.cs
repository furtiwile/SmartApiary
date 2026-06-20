using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Features.SmartScales.Commands
{
    public record ActivateSmartScaleCommand : IRequest<Result<string>>
    {
        public string SerialNumber { get; init; } = string.Empty;
        public string HardwareId { get; init; } = string.Empty;
    }

    public class ActivateSmartScaleValidator : AbstractValidator<ActivateSmartScaleCommand>
    {
        public ActivateSmartScaleValidator()
        {
            RuleFor(x => x.SerialNumber).NotEmpty();
            RuleFor(x => x.HardwareId).NotEmpty();
        }
    }

    internal class ActivateSmartScaleHandler(
        ISmartScaleRepository smartScaleRepository,
        IDeviceTokenGenerator tokenGenerator)
        : IRequestHandler<ActivateSmartScaleCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(ActivateSmartScaleCommand request, CancellationToken ct)
        {
            var smartScale = await smartScaleRepository.GetBySerialNumberAsync(request.SerialNumber, ct);
            if (smartScale == null)
                return Result<string>.Failure("Smart scale not found", ErrorType.NotFound);

            if (smartScale.Status == DeviceStatusEnum.Paired)
            {
                // If already paired, return existing token so device can continue sending telemetry.
                if (!string.IsNullOrWhiteSpace(smartScale.DeviceToken))
                    return Result<string>.Success(smartScale.DeviceToken);

                // Edge case: paired but missing token - generate one
                smartScale.RefreshDeviceToken(tokenGenerator.GenerateToken());
                await smartScaleRepository.UpdateAsync(smartScale, ct);
                return Result<string>.Success(smartScale.DeviceToken);
            }

            if (smartScale.Status != DeviceStatusEnum.Paired)
            {
                await smartScaleRepository.DeleteAsync(smartScale, ct);
            }

            smartScale.Activate(request.HardwareId, tokenGenerator.GenerateToken());

            await smartScaleRepository.SaveAsync(smartScale, ct);

            return Result<string>.Success(smartScale.DeviceToken);
        }
    }
}
