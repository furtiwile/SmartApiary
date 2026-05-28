using FluentValidation;
using MediatR;
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

    internal class CreateCropHandler(ICropRepository cropRepository)
        : IRequestHandler<CreateCropCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(CreateCropCommand request, CancellationToken ct)
        {
            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
                return Result<string>.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);

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
