using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Crops.Commands
{
    public record CreateCropCommand : IRequest<Result<string>>
    {
        public string ParcelId { get; init; } = string.Empty;
        public CropType Type { get; init; }
        public DateTime ExpectedFloweringTime { get; init; }
        public string Note { get; init; } = string.Empty;
    }

    public class CreateCropValidator : AbstractValidator<CreateCropCommand>
    {
        public CreateCropValidator()
        {
            RuleFor(x => x.ParcelId).NotEmpty();
        }
    }

    internal class CreateCropHandler(
        ICropRepository cropRepository,
        IParcelRepository parcelRepository,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<CreateCropCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(CreateCropCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result<string>.Failure("Unauthorized", ErrorType.Unauthorized);

            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
                return Result<string>.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);

            // Verify parcel ownership
            var parcel = await parcelRepository.GetByIdAsync(parcelIdResult.Value, ct);
            if (parcel == null)
                return Result<string>.Failure("Parcel not found", ErrorType.NotFound);

            if (parcel.FarmerId.Value != currentUser.UserId)
                return Result<string>.Failure("Unauthorized - you do not own this parcel.", ErrorType.Unauthorized);

            var cropResult = Crop.Create(
                request.Type,
                request.ExpectedFloweringTime,
                request.Note,
                parcelIdResult.Value
            );

            if (cropResult.IsFailure)
                return Result<string>.Failure(cropResult.Error!.Message, ErrorType.Validation);

            await cropRepository.SaveAsync(cropResult.Value, ct);

            return Result<string>.Success(cropResult.Value.Id.Value);
        }
    }
}
