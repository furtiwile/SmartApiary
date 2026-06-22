using MediatR;
using SmartApiary.Application.Common;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;

namespace SmartApiary.Application.Features.Crops.Queries
{
    public record GetAllCropsQuery : IRequest<Result<IEnumerable<CropWithParcelDto>>>;

    public record CropWithParcelDto(
        string Id,
        string Type,
        string ExpectedFloweringTime,
        string Note,
        string ParcelId,
        string ParcelName,
        double Latitude,
        double Longitude,
        string FarmerId
    );

    internal class GetAllCropsQueryHandler(
        ICropRepository cropRepository,
        IParcelRepository parcelRepository
    ) : IRequestHandler<GetAllCropsQuery, Result<IEnumerable<CropWithParcelDto>>>
    {
        public async Task<Result<IEnumerable<CropWithParcelDto>>> Handle(GetAllCropsQuery request, CancellationToken ct)
        {
            var crops = await cropRepository.GetAllAsync(ct);
            var parcels = await parcelRepository.GetAllAsync(ct);
            var parcelDict = parcels.ToDictionary(p => p.Id.Value);

            var result = crops
                .Where(c => parcelDict.ContainsKey(c.ParcelId.Value))
                .Select(c =>
                {
                    var parcel = parcelDict[c.ParcelId.Value];
                    return new CropWithParcelDto(
                        c.Id.Value,
                        c.Type.ToString(),
                        c.ExpectedFloweringTime.ToString("yyyy-MM-dd"),
                        c.Note,
                        parcel.Id.Value,
                        parcel.Name,
                        parcel.Latitude,
                        parcel.Longitude,
                        parcel.FarmerId.Value
                    );
                })
                .ToList();

            return Result<IEnumerable<CropWithParcelDto>>.Success(result);
        }
    }
}
