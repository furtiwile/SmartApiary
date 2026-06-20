using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Application.Features.Geo.Queries
{
    public record CropNearApiaryDto(
        string CropId,
        string CropType,
        DateTime ExpectedFloweringTime,
        string Note,
        string ParcelId,
        string ParcelName,
        double Latitude,
        double Longitude,
        string FarmerName,
        string FarmerContact
    );

    public record GetCropsNearApiariesQuery(double RadiusKm = 5) : IRequest<Result<IReadOnlyCollection<CropNearApiaryDto>>>;

    internal class GetCropsNearApiariesHandler(
        IApiaryRepository apiaryRepository,
        IParcelRepository parcelRepository,
        ICropRepository cropRepository,
        IUserRepository userRepository,
        ICurrentUserContext currentUser
    ) : IRequestHandler<GetCropsNearApiariesQuery, Result<IReadOnlyCollection<CropNearApiaryDto>>>
    {
        public async Task<Result<IReadOnlyCollection<CropNearApiaryDto>>> Handle(GetCropsNearApiariesQuery request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result<IReadOnlyCollection<CropNearApiaryDto>>.Failure("Unauthorized", ErrorType.Unauthorized);

            var beekeeperIdResult = EntityId.Create(currentUser.UserId);
            if (beekeeperIdResult.IsFailure)
                return Result<IReadOnlyCollection<CropNearApiaryDto>>.Failure(beekeeperIdResult.Error!.Message, ErrorType.Validation);

            var myApiaries = await apiaryRepository.GetByBeekeeperIdAsync(beekeeperIdResult.Value, ct);
            if (!myApiaries.Any())
                return Result<IReadOnlyCollection<CropNearApiaryDto>>.Success(new List<CropNearApiaryDto>());

            var radiusMeters = request.RadiusKm * 1000.0;
            var cropsMap = new Dictionary<string, CropNearApiaryDto>();

            foreach (var apiary in myApiaries)
            {
                var parcels = await parcelRepository.GetParcelsWithinRadiusAsync(apiary.Latitude, apiary.Longitude, radiusMeters, ct);
                
                foreach (var parcel in parcels)
                {
                    var farmer = await userRepository.GetUserByIdAsync(parcel.FarmerId, ct);
                    var farmerName = farmer != null ? $"{farmer.FirstName} {farmer.LastName}" : "Unknown Farmer";
                    var farmerContact = farmer?.PhoneNumber ?? string.Empty;

                    var crops = await cropRepository.GetByParcelIdAsync(parcel.Id, ct);
                    foreach (var crop in crops)
                    {
                        var key = $"{parcel.Id.Value}_{crop.Id.Value}";
                        if (!cropsMap.ContainsKey(key))
                        {
                            cropsMap[key] = new CropNearApiaryDto(
                                crop.Id.Value,
                                crop.Type.ToString(),
                                crop.ExpectedFloweringTime,
                                crop.Note,
                                parcel.Id.Value,
                                parcel.Name,
                                parcel.Latitude,
                                parcel.Longitude,
                                farmerName,
                                farmerContact
                            );
                        }
                    }
                }
            }

            var result = cropsMap.Values.OrderBy(x => x.ExpectedFloweringTime).ToList();
            return Result<IReadOnlyCollection<CropNearApiaryDto>>.Success(result);
        }
    }
}
