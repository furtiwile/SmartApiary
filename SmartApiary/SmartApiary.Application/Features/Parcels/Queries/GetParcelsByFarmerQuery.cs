using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Parcels.Queries
{
    public record ParcelDto(
        string Id,
        string Name,
        double Latitude,
        double Longitude,
        string FarmerId
    );

    public record GetParcelsByFarmerQuery(string FarmerId) : IRequest<Result<IReadOnlyCollection<ParcelDto>>>;

    internal class GetParcelsByFarmerHandler(IParcelRepository parcelRepository)
        : IRequestHandler<GetParcelsByFarmerQuery, Result<IReadOnlyCollection<ParcelDto>>>
    {
        public async Task<Result<IReadOnlyCollection<ParcelDto>>> Handle(GetParcelsByFarmerQuery request, CancellationToken ct)
        {
            var farmerIdResult = EntityId.Create(request.FarmerId);
            if (farmerIdResult.IsFailure)
                return Result<IReadOnlyCollection<ParcelDto>>.Failure(farmerIdResult.Error!.Message, ErrorType.Validation);

            var parcels = await parcelRepository.GetByFarmerIdAsync(farmerIdResult.Value, ct);

            var result = parcels
                .Select(p => new ParcelDto(
                    p.Id.Value,
                    p.Name,
                    p.Latitude,
                    p.Longitude,
                    p.FarmerId.Value))
                .ToList();

            return Result<IReadOnlyCollection<ParcelDto>>.Success(result);
        }
    }
}
