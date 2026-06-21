using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Geo.Queries
{
    public record ApiaryGeoDto(
        string Id,
        string Name,
        double Latitude,
        double Longitude,
        double DistanceKm
    );

    public record GetApiariesNearParcelQuery(string ParcelId, double RadiusKm = 5) : IRequest<Result<IReadOnlyCollection<ApiaryGeoDto>>>;

    internal class GetApiariesNearParcelHandler(
        IParcelRepository parcelRepository,
        IApiaryRepository apiaryRepository)
        : IRequestHandler<GetApiariesNearParcelQuery, Result<IReadOnlyCollection<ApiaryGeoDto>>>
    {
        public async Task<Result<IReadOnlyCollection<ApiaryGeoDto>>> Handle(GetApiariesNearParcelQuery request, CancellationToken ct)
        {
            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
                return Result<IReadOnlyCollection<ApiaryGeoDto>>.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);

            var parcel = await parcelRepository.GetByIdAsync(parcelIdResult.Value, ct);
            if (parcel == null)
                return Result<IReadOnlyCollection<ApiaryGeoDto>>.Failure("Parcel not found", ErrorType.NotFound);

            var apiaries = await apiaryRepository.GetApiariesWithinRadiusAsync(
                parcel.Latitude,
                parcel.Longitude,
                request.RadiusKm * 1000,
                ct);

            var results = apiaries
                .Select(a => new
                {
                    Apiary = a,
                    Distance = DistanceKm(parcel.Latitude, parcel.Longitude, a.Latitude, a.Longitude)
                })
                .OrderBy(x => x.Distance)
                .Select(x => new ApiaryGeoDto(
                    x.Apiary.Id.Value,
                    x.Apiary.Name,
                    x.Apiary.Latitude,
                    x.Apiary.Longitude,
                    Math.Round(x.Distance, 3)))
                .ToList();

            return Result<IReadOnlyCollection<ApiaryGeoDto>>.Success(results);
        }

        private static double DistanceKm(double lat1, double lon1, double lat2, double lon2)
        {
            const double EarthRadiusKm = 6371.0;

            double dLat = DegreesToRadians(lat2 - lat1);
            double dLon = DegreesToRadians(lon2 - lon1);

            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return EarthRadiusKm * c;
        }

        private static double DegreesToRadians(double degrees) => degrees * (Math.PI / 180.0);
    }
}