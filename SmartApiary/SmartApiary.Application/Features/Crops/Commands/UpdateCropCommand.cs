using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Crops.Commands
{
    public record UpdateCropCommand : IRequest<Result>
    {
        public string ParcelId { get; init; } = string.Empty;
        public string CropId { get; init; } = string.Empty;
        public CropType Type { get; init; }
        public DateTime ExpectedFloweringTime { get; init; }
        public string Note { get; init; } = string.Empty;
    }

    public class UpdateCropValidator : AbstractValidator<UpdateCropCommand>
    {
        public UpdateCropValidator()
        {
            RuleFor(x => x.ParcelId).NotEmpty();
            RuleFor(x => x.CropId).NotEmpty();
        }
    }

    internal class UpdateCropHandler(
        ICropRepository cropRepository,
        IParcelRepository parcelRepository,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<UpdateCropCommand, Result>
    {
        public async Task<Result> Handle(UpdateCropCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result.Failure("Unauthorized", ErrorType.Unauthorized);

            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
                return Result.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);

            var cropIdResult = EntityId.Create(request.CropId);
            if (cropIdResult.IsFailure)
                return Result.Failure(cropIdResult.Error!.Message, ErrorType.Validation);

            // Verify parcel ownership
            var parcel = await parcelRepository.GetByIdAsync(parcelIdResult.Value, ct);
            if (parcel == null)
                return Result.Failure("Parcel not found", ErrorType.NotFound);

            if (parcel.FarmerId.Value != currentUser.UserId)
                return Result.Failure("Unauthorized - you do not own this parcel.", ErrorType.Unauthorized);

            var crop = await cropRepository.GetByIdAsync(parcelIdResult.Value, cropIdResult.Value, ct);
            if (crop == null)
                return Result.Failure("Crop not found", ErrorType.NotFound);

            crop.Update(
                request.Type,
                request.ExpectedFloweringTime,
                request.Note
            );

            await cropRepository.UpdateAsync(crop, ct);

            return Result.Success();
        }
    }
}
