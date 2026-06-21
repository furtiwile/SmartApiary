using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;

namespace SmartApiary.Application.Features.SmartScales.Queries
{
    public record GetUnpairedSmartScalesQuery() : IRequest<Result<IReadOnlyCollection<SmartScaleDto>>>;

    internal class GetUnpairedSmartScalesHandler(
        ISmartScaleRepository smartScaleRepository,
        ICurrentUserContext currentUser,
        IHiveRepository hiveRepository
    ) : IRequestHandler<GetUnpairedSmartScalesQuery, Result<IReadOnlyCollection<SmartScaleDto>>>
    {
        public async Task<Result<IReadOnlyCollection<SmartScaleDto>>> Handle(GetUnpairedSmartScalesQuery request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper)
                return Result<IReadOnlyCollection<SmartScaleDto>>.Failure("Unauthorized", ErrorType.Unauthorized);

            // Fetch only Unpaired smart scales
            var scales = await smartScaleRepository.GetByStatusAsync(DeviceStatusEnum.Unpaired, ct);
            var resultList = new List<SmartScaleDto>();

            foreach (var smartScale in scales)
            {
                resultList.Add(new SmartScaleDto(
                    smartScale.Id.Value,
                    smartScale.SerialNumber,
                    smartScale.Status.ToString(),
                    false, // Always false for Unpaired
                    null,  // Always null for Unpaired
                    smartScale.DeviceToken
                ));
            }

            return Result<IReadOnlyCollection<SmartScaleDto>>.Success(resultList);
        }
    }
}
