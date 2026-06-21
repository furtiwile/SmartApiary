using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.HiveInspections.Queries
{
    public record HiveInspectionDto(
        string Id,
        string HiveId,
        DateTime InspectionDate,
        string BottomBoardColor,
        int HoneyFrames,
        double HoneyAmount,
        int BroodFrames,
        bool QueenPresent,
        string Note
    );

    public record GetHiveInspectionsByHiveQuery(string HiveId, int PageNumber = 1, int PageSize = 10) : IRequest<Result<IReadOnlyCollection<HiveInspectionDto>>>;

    internal class GetHiveInspectionsByHiveHandler(IHiveInspectionRepository inspectionRepository)
        : IRequestHandler<GetHiveInspectionsByHiveQuery, Result<IReadOnlyCollection<HiveInspectionDto>>>
    {
        public async Task<Result<IReadOnlyCollection<HiveInspectionDto>>> Handle(GetHiveInspectionsByHiveQuery request, CancellationToken ct)
        {
            var hiveIdResult = EntityId.Create(request.HiveId);
            if (hiveIdResult.IsFailure)
                return Result<IReadOnlyCollection<HiveInspectionDto>>.Failure(hiveIdResult.Error!.Message, ErrorType.Validation);

            var items = await inspectionRepository.GetByHiveIdAsync(hiveIdResult.Value, request.PageNumber, request.PageSize, ct);

            var result = items
                .Select(x => new HiveInspectionDto(
                    x.Id.Value,
                    x.HiveId.Value,
                    x.InspectionDate,
                    x.BottomBoardColor,
                    x.HoneyFrames,
                    x.HoneyAmount,
                    x.BroodFrames,
                    x.QueenPresent,
                    x.Note))
                .ToList();

            return Result<IReadOnlyCollection<HiveInspectionDto>>.Success(result);
        }
    }
}
