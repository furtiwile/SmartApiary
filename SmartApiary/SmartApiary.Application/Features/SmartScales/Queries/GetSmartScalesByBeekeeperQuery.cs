using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Features.SmartScales.Queries
{
    public record SmartScaleDto(
        string Id,
        string SerialNumber,
        string Status,
        bool IsActivated,
        string? HiveId,
        string DeviceToken
    );

    public record GetSmartScalesByBeekeeperQuery() : IRequest<Result<IReadOnlyCollection<SmartScaleDto>>>;

    internal class GetSmartScalesByBeekeeperHandler(
        IApiaryRepository apiaryRepository,
        IHiveRepository hiveRepository,
        ISmartScaleRepository smartScaleRepository,
        ICurrentUserContext currentUser
    ) : IRequestHandler<GetSmartScalesByBeekeeperQuery, Result<IReadOnlyCollection<SmartScaleDto>>>
    {
        public async Task<Result<IReadOnlyCollection<SmartScaleDto>>> Handle(GetSmartScalesByBeekeeperQuery request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != Domain.Enums.RoleType.Beekeeper || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result<IReadOnlyCollection<SmartScaleDto>>.Failure("Unauthorized", ErrorType.Unauthorized);

            var beekeeperIdResult = EntityId.Create(currentUser.UserId!);
            if (beekeeperIdResult.IsFailure)
                return Result<IReadOnlyCollection<SmartScaleDto>>.Failure(beekeeperIdResult.Error!.Message, ErrorType.Validation);

            var apiaries = await apiaryRepository.GetByBeekeeperIdAsync(beekeeperIdResult.Value, ct);

            var hiveMap = new Dictionary<string, string>(); // smartScaleId -> hiveId

            foreach (var apiary in apiaries)
            {
                var hives = await hiveRepository.GetByApiaryIdAsync(apiary.Id, ct);
                foreach (var hive in hives)
                {
                    if (!string.IsNullOrWhiteSpace(hive.SmartScaleId?.Value))
                        hiveMap[hive.SmartScaleId.Value] = hive.Id.Value;
                }
            }

            var resultList = new List<SmartScaleDto>();

            foreach (var kv in hiveMap)
            {
                var smartScale = await smartScaleRepository.GetByIdAsync(SmartApiary.Domain.ValueObjects.EntityId.Create(kv.Key).Value, ct);
                if (smartScale == null) continue;

                resultList.Add(new SmartScaleDto(
                    smartScale.Id.Value,
                    smartScale.SerialNumber,
                    smartScale.Status.ToString(),
                    smartScale.Status == SmartApiary.Domain.Enums.DeviceStatusEnum.Paired,
                    kv.Value,
                    smartScale.DeviceToken
                ));
            }

            return Result<IReadOnlyCollection<SmartScaleDto>>.Success(resultList);
        }
    }
}
