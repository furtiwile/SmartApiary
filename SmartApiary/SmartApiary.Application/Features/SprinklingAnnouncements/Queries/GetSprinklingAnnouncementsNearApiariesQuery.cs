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

namespace SmartApiary.Application.Features.SprinklingAnnouncements.Queries
{
    public record SprinklingAnnouncementNearApiaryDto(
        string AnnouncementId,
        string ParcelId,
        string ParcelName,
        double Latitude,
        double Longitude,
        DateTime StartTime,
        double ExpectedDurationHours,
        string PreparationType,
        bool IsCancelled,
        int NotifiedBeekeepersCount
    );

    public record GetSprinklingAnnouncementsNearApiariesQuery(double RadiusKm = 5) : IRequest<Result<IReadOnlyCollection<SprinklingAnnouncementNearApiaryDto>>>;

    internal class GetSprinklingAnnouncementsNearApiariesHandler(
        IApiaryRepository apiaryRepository,
        IParcelRepository parcelRepository,
        ISprinklingAnnouncementRepository announcementRepository,
        ICurrentUserContext currentUser
    ) : IRequestHandler<GetSprinklingAnnouncementsNearApiariesQuery, Result<IReadOnlyCollection<SprinklingAnnouncementNearApiaryDto>>>
    {
        public async Task<Result<IReadOnlyCollection<SprinklingAnnouncementNearApiaryDto>>> Handle(GetSprinklingAnnouncementsNearApiariesQuery request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result<IReadOnlyCollection<SprinklingAnnouncementNearApiaryDto>>.Failure("Unauthorized", ErrorType.Unauthorized);

            var beekeeperIdResult = EntityId.Create(currentUser.UserId);
            if (beekeeperIdResult.IsFailure)
                return Result<IReadOnlyCollection<SprinklingAnnouncementNearApiaryDto>>.Failure(beekeeperIdResult.Error!.Message, ErrorType.Validation);

            var myApiaries = await apiaryRepository.GetByBeekeeperIdAsync(beekeeperIdResult.Value, ct);
            if (!myApiaries.Any())
                return Result<IReadOnlyCollection<SprinklingAnnouncementNearApiaryDto>>.Success(new List<SprinklingAnnouncementNearApiaryDto>());

            var radiusMeters = request.RadiusKm * 1000.0;
            var announcementsMap = new Dictionary<string, SprinklingAnnouncementNearApiaryDto>();

            foreach (var apiary in myApiaries)
            {
                var parcels = await parcelRepository.GetParcelsWithinRadiusAsync(apiary.Latitude, apiary.Longitude, radiusMeters, ct);

                foreach (var parcel in parcels)
                {
                    var announcements = await announcementRepository.GetByParcelIdAsync(parcel.Id, ct);
                    foreach (var ann in announcements)
                    {
                        if (!announcementsMap.ContainsKey(ann.Id.Value))
                        {
                            announcementsMap[ann.Id.Value] = new SprinklingAnnouncementNearApiaryDto(
                                ann.Id.Value,
                                parcel.Id.Value,
                                parcel.Name,
                                parcel.Latitude,
                                parcel.Longitude,
                                ann.StartTime,
                                ann.ExpectedDurationHours,
                                ann.PreparationType,
                                ann.IsCancelled,
                                ann.NotifiedBeekeepersCount
                            );
                        }
                    }
                }
            }

            var result = announcementsMap.Values.OrderByDescending(x => x.StartTime).ToList();
            return Result<IReadOnlyCollection<SprinklingAnnouncementNearApiaryDto>>.Success(result);
        }
    }
}
