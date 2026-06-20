using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Application.Features.SprinklingRecords.Queries
{
    public record SprinklingRecordDto(
        string Id,
        string AnnouncementId,
        DateTime ActualStartTime,
        DateTime ActualEndTime,
        string PreparationType,
        double WindSpeed,
        double Precipitation,
        string WeatherCondition,
        string ParcelName,
        string CropType
    );

    public record GetSprinklingRecordsByAnnouncementQuery(
        string? AnnouncementId = null,
        string? ParcelId = null,
        DateTime? FromDate = null,
        DateTime? ToDate = null
    ) : IRequest<Result<IReadOnlyCollection<SprinklingRecordDto>>>;

    internal class GetSprinklingRecordsByAnnouncementHandler(
        ISprinklingRecordRepository recordRepository,
        ISprinklingAnnouncementRepository announcementRepository,
        IParcelRepository parcelRepository,
        ICropRepository cropRepository
    ) : IRequestHandler<GetSprinklingRecordsByAnnouncementQuery, Result<IReadOnlyCollection<SprinklingRecordDto>>>
    {
        public async Task<Result<IReadOnlyCollection<SprinklingRecordDto>>> Handle(GetSprinklingRecordsByAnnouncementQuery request, CancellationToken ct)
        {
            var allowedAnnouncementIds = new HashSet<string>();

            if (!string.IsNullOrWhiteSpace(request.AnnouncementId))
            {
                allowedAnnouncementIds.Add(request.AnnouncementId);
            }
            else if (!string.IsNullOrWhiteSpace(request.ParcelId))
            {
                var parcelIdResult = EntityId.Create(request.ParcelId);
                if (parcelIdResult.IsFailure)
                {
                    return Result<IReadOnlyCollection<SprinklingRecordDto>>.Failure(parcelIdResult.Error!.Message, ErrorType.Validation);
                }

                var announcements = await announcementRepository.GetByParcelIdAsync(parcelIdResult.Value, ct);
                foreach (var ann in announcements)
                {
                    allowedAnnouncementIds.Add(ann.Id.Value);
                }
            }
            else
            {
                var allAnnouncements = await announcementRepository.GetAllAsync(ct);
                foreach (var ann in allAnnouncements)
                {
                    allowedAnnouncementIds.Add(ann.Id.Value);
                }
            }

            var allRecords = new List<SprinklingRecordDto>();

            foreach (var annId in allowedAnnouncementIds)
            {
                var entityId = EntityId.Create(annId);
                if (entityId.IsFailure) continue;

                var announcement = await announcementRepository.GetByIdAsync(entityId.Value, ct);
                if (announcement == null) continue;

                var parcel = await parcelRepository.GetByIdAsync(announcement.ParcelId, ct);
                var parcelName = parcel?.Name ?? "Unknown Parcel";

                var crops = await cropRepository.GetByParcelIdAsync(announcement.ParcelId, ct);
                var cropTypeStr = crops.Any() ? string.Join(", ", crops.Select(c => c.Type.ToString())) : "None";

                var records = await recordRepository.GetByAnnouncementIdAsync(entityId.Value, ct);
                var query = records.AsQueryable();

                if (request.FromDate.HasValue)
                {
                    query = query.Where(x => x.ActualStartTime >= request.FromDate.Value);
                }

                if (request.ToDate.HasValue)
                {
                    query = query.Where(x => x.ActualEndTime <= request.ToDate.Value);
                }

                var filteredDtos = query.ToList().Select(x => new SprinklingRecordDto(
                    x.Id.Value,
                    x.AnnouncementId.Value,
                    x.ActualStartTime,
                    x.ActualEndTime,
                    x.PreparationType,
                    x.WindSpeed,
                    x.Precipitation,
                    x.WeatherCondition,
                    parcelName,
                    cropTypeStr));

                allRecords.AddRange(filteredDtos);
            }

            var result = allRecords.OrderByDescending(x => x.ActualStartTime).ToList();
            return Result<IReadOnlyCollection<SprinklingRecordDto>>.Success(result);
        }
    }
}