using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Crops.Queries
{
    public record CropDto(
        string Id,
        string ParcelId,
        string Type,
        DateTime ExpectedFloweringTime,
        string Note
    );

    public record GetCropsByParcelQuery(string ParcelId) : IRequest<Result<IReadOnlyCollection<CropDto>>>;

    internal class GetCropsByParcelHandler(ICropRepository cropRepository)
        : IRequestHandler<GetCropsByParcelQuery, Result<IReadOnlyCollection<CropDto>>>
    {
        public async Task<Result<IReadOnlyCollection<CropDto>>> Handle(GetCropsByParcelQuery request, CancellationToken ct)
        {
            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
                return Result<IReadOnlyCollection<CropDto>>.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);

            var crops = await cropRepository.GetByParcelIdAsync(parcelIdResult.Value, ct);

            var result = crops
                .Select(c => new CropDto(
                    c.Id.Value,
                    c.ParcelId.Value,
                    c.Type.ToString(),
                    c.ExpectedFloweringTime,
                    c.Note))
                .ToList();

            return Result<IReadOnlyCollection<CropDto>>.Success(result);
        }
    }
}
