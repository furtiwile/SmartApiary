using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Apiaries.Queries
{
    public record ApiaryDto(
        string Id,
        string Name,
        double Latitude,
        double Longitude,
        string Description,
        string ImageUrl,
        string ThumbnailUrl
    );

    public record GetApiariesByBeekeeperQuery() : IRequest<Result<IReadOnlyCollection<ApiaryDto>>>;

    internal class GetApiariesByBeekeeperHandler(
        IApiaryRepository apiaryRepository,
        ICurrentUserContext currentUser
    )
        : IRequestHandler<GetApiariesByBeekeeperQuery, Result<IReadOnlyCollection<ApiaryDto>>>
    {
        public async Task<Result<IReadOnlyCollection<ApiaryDto>>> Handle(GetApiariesByBeekeeperQuery request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || currentUser.Role != RoleType.Beekeeper || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result<IReadOnlyCollection<ApiaryDto>>.Failure("Unauthorized", ErrorType.Unauthorized);

            var beekeeperIdResult = EntityId.Create(currentUser.UserId);
            if (beekeeperIdResult.IsFailure)
                return Result<IReadOnlyCollection<ApiaryDto>>.Failure(beekeeperIdResult.Error!.Message, ErrorType.Validation);

            var apiaries = await apiaryRepository.GetByBeekeeperIdAsync(beekeeperIdResult.Value, ct);

            var result = apiaries
                .Select(a => new ApiaryDto(
                    a.Id.Value,
                    a.Name,
                    a.Latitude,
                    a.Longitude,
                    a.Description,
                    a.ImageUrl,
                    a.ThumbnailUrl))
                .ToList();

            return Result<IReadOnlyCollection<ApiaryDto>>.Success(result);
        }
    }
}
