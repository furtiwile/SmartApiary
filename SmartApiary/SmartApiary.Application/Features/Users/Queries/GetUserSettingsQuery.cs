using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Users.Queries
{
    public record UserSettingsDto(double WeightDropThreshold);

    public record GetUserSettingsQuery() : IRequest<Result<UserSettingsDto>>;

    internal class GetUserSettingsHandler(
        IUserRepository userRepository,
        ICurrentUserContext currentUser
    ) : IRequestHandler<GetUserSettingsQuery, Result<UserSettingsDto>>
    {
        public async Task<Result<UserSettingsDto>> Handle(GetUserSettingsQuery request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result<UserSettingsDto>.Failure("Unauthorized", ErrorType.Unauthorized);

            var userIdResult = EntityId.Create(currentUser.UserId);
            if (userIdResult.IsFailure)
                return Result<UserSettingsDto>.Failure("Invalid user id", ErrorType.Validation);

            var user = await userRepository.GetUserByIdAsync(userIdResult.Value, ct);
            if (user == null)
                return Result<UserSettingsDto>.Failure("User not found", ErrorType.NotFound);

            return Result<UserSettingsDto>.Success(new UserSettingsDto(user.WeightDropThreshold));
        }
    }
}
