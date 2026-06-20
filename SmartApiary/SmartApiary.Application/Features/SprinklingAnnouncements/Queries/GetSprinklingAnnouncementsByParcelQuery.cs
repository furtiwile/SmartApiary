using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;
using System.Linq;

namespace SmartApiary.Application.Features.SprinklingAnnouncements.Queries
{
    public record SprinklingAnnouncementDto(
        string Id,
        string ParcelId,
        DateTime StartTime,
        double ExpectedDurationHours,
        string PreparationType,
        bool IsCancelled,
        int NotifiedBeekeepersCount
    );

    public record GetSprinklingAnnouncementsByParcelQuery(string ParcelId) : IRequest<Result<IReadOnlyCollection<SprinklingAnnouncementDto>>>;

    internal class GetSprinklingAnnouncementsByParcelHandler(ISprinklingAnnouncementRepository announcementRepository)
        : IRequestHandler<GetSprinklingAnnouncementsByParcelQuery, Result<IReadOnlyCollection<SprinklingAnnouncementDto>>>
    {
        public async Task<Result<IReadOnlyCollection<SprinklingAnnouncementDto>>> Handle(GetSprinklingAnnouncementsByParcelQuery request, CancellationToken ct)
        {
            var parcelIdResult = EntityId.Create(request.ParcelId);
            if (parcelIdResult.IsFailure)
                return Result<IReadOnlyCollection<SprinklingAnnouncementDto>>.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);

            var items = await announcementRepository.GetByParcelIdAsync(parcelIdResult.Value, ct);

            var result = items
                .OrderByDescending(x => x.StartTime)
                .Select(x => new SprinklingAnnouncementDto(
                    x.Id.Value,
                    x.ParcelId.Value,
                    x.StartTime,
                    x.ExpectedDurationHours,
                    x.PreparationType,
                    x.IsCancelled,
                    x.NotifiedBeekeepersCount))
                .ToList();

            return Result<IReadOnlyCollection<SprinklingAnnouncementDto>>.Success(result);
        }
    }
}
