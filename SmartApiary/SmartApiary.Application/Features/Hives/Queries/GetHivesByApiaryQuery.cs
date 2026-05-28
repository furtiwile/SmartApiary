using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Hives.Queries
{
    public record HiveDto(
        string Id,
        string ApiaryId,
        string Designation,
        HiveType Type,
        string SuperColor,
        int QueenAge,
        string Note,
        string SmartScaleId
    );

    public record GetHivesByApiaryQuery(string ApiaryId) : IRequest<Result<IReadOnlyCollection<HiveDto>>>;

    internal class GetHivesByApiaryHandler(
        IHiveRepository hiveRepository,
        IApiaryRepository apiaryRepository,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<GetHivesByApiaryQuery, Result<IReadOnlyCollection<HiveDto>>>
    {
        public async Task<Result<IReadOnlyCollection<HiveDto>>> Handle(GetHivesByApiaryQuery request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result<IReadOnlyCollection<HiveDto>>.Failure("Unauthorized", ErrorType.Unauthorized);

            var beekeeperIdResult = EntityId.Create(currentUser.UserId);
            if (beekeeperIdResult.IsFailure)
                return Result<IReadOnlyCollection<HiveDto>>.Failure(beekeeperIdResult.Error!.Message, ErrorType.Validation);

            var apiaryIdResult = EntityId.Create(request.ApiaryId);
            if (apiaryIdResult.IsFailure)
                return Result<IReadOnlyCollection<HiveDto>>.Failure(apiaryIdResult.Error!.Message, ErrorType.Validation);

            var apiary = await apiaryRepository.GetByIdAsync(beekeeperIdResult.Value, apiaryIdResult.Value, ct);
            if (apiary == null)
                return Result<IReadOnlyCollection<HiveDto>>.Failure("Apiary not found", ErrorType.NotFound);

            var hives = await hiveRepository.GetByApiaryIdAsync(apiaryIdResult.Value, ct);

            var result = hives
                .Select(h => new HiveDto(
                    h.Id.Value,
                    h.ApiaryId.Value,
                    h.Designation,
                    h.Type,
                    h.SuperColor,
                    h.QueenAge,
                    h.Note,
                    h.SmartScaleId.Value))
                .ToList();

            return Result<IReadOnlyCollection<HiveDto>>.Success(result);
        }
    }
}
