using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;
using System.Linq;

namespace SmartApiary.Application.Features.SprinklingRecords.Queries
{
    public record SprinklingRecordDto(
        string Id,
        string AnnouncementId,
        DateTime ActualStartTime,
        DateTime ActualEndTime,
        string PreparationType,
        double WindSpeed,
        double Precipitation
    );

    public record GetSprinklingRecordsByAnnouncementQuery(string AnnouncementId) : IRequest<Result<IReadOnlyCollection<SprinklingRecordDto>>>;

    internal class GetSprinklingRecordsByAnnouncementHandler(ISprinklingRecordRepository recordRepository)
        : IRequestHandler<GetSprinklingRecordsByAnnouncementQuery, Result<IReadOnlyCollection<SprinklingRecordDto>>>
    {
        public async Task<Result<IReadOnlyCollection<SprinklingRecordDto>>> Handle(GetSprinklingRecordsByAnnouncementQuery request, CancellationToken ct)
        {
            var announcementIdResult = EntityId.Create(request.AnnouncementId);
            if (announcementIdResult.IsFailure)
                return Result<IReadOnlyCollection<SprinklingRecordDto>>.Failure(announcementIdResult.Error!.Message, ErrorType.Validation);

            var items = await recordRepository.GetByAnnouncementIdAsync(announcementIdResult.Value, ct);

            var result = items
                .OrderByDescending(x => x.ActualStartTime)
                .Select(x => new SprinklingRecordDto(
                    x.Id.Value,
                    x.AnnouncementId.Value,
                    x.ActualStartTime,
                    x.ActualEndTime,
                    x.PreparationType,
                    x.WindSpeed,
                    x.Precipitation))
                .ToList();

            return Result<IReadOnlyCollection<SprinklingRecordDto>>.Success(result);
        }
    }
}
