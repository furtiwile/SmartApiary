using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.SmartScales.Commands
{
    public record CreateSmartScaleCommand() : IRequest<Result<string>>;

    internal class CreateSmartScaleHandler(
        ISmartScaleRepository smartScaleRepository,
        ICurrentUserContext currentUser
    ) : IRequestHandler<CreateSmartScaleCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(CreateSmartScaleCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper)
                return Result<string>.Failure("Unauthorized", ErrorType.Unauthorized);

            var serialNumber = SmartScale.GenerateSerialNumber();

            // Ensure uniqueness
            var existing = await smartScaleRepository.GetBySerialNumberAsync(serialNumber, ct);
            while (existing != null)
            {
                serialNumber = SmartScale.GenerateSerialNumber();
                existing = await smartScaleRepository.GetBySerialNumberAsync(serialNumber, ct);
            }

            var smartScaleResult = SmartScale.CreateUnpaired(serialNumber);
            if (smartScaleResult.IsFailure)
                return Result<string>.Failure(smartScaleResult.Error!.Message, ErrorType.Validation);

            await smartScaleRepository.SaveAsync(smartScaleResult.Value, ct);

            return Result<string>.Success(smartScaleResult.Value.SerialNumber);
        }
    }
}
