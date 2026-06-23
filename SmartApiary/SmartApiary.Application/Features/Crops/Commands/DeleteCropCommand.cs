using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Crops.Commands
{
    public record DeleteCropCommand(string ParcelId, string CropId) : IRequest<Result>;

    public class DeleteCropValidator : AbstractValidator<DeleteCropCommand>
    {
        public DeleteCropValidator()
        {
            RuleFor(x => x.ParcelId).NotEmpty();
            RuleFor(x => x.CropId).NotEmpty();
        }
    }

    internal class DeleteCropHandler(
        ICropRepository cropRepository,
        IParcelRepository parcelRepository,
        ICurrentUserContext currentUser,
        IDateTimeProvider dateTimeProvider
    )
        : IRequestHandler<DeleteCropCommand, Result>
    {
        public async Task<Result> Handle(DeleteCropCommand request, CancellationToken ct)
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

            if (!crop.HasExpectedFloweringTimePassed(dateTimeProvider.UtcNow))
            {
                var localBloomEnd = crop.ExpectedFloweringTime;
                return Result.Failure($"The crop cannot be deleted because it has not yet bloomed. It will become deletable on/after its expected bloom date: {localBloomEnd:yyyy-MM-dd HH:mm UTC}.", ErrorType.Validation);
            }

            await cropRepository.DeleteAsync(crop, ct);

            return Result.Success();
        }
    }
}
