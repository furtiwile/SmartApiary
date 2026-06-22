using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Users.Commands
{
    public record UpdateUserSettingsCommand(double WeightDropThreshold) : IRequest<Result>;

    public class UpdateUserSettingsValidator : AbstractValidator<UpdateUserSettingsCommand>
    {
        public UpdateUserSettingsValidator()
        {
            RuleFor(x => x.WeightDropThreshold).GreaterThan(0);
        }
    }

    internal class UpdateUserSettingsHandler(
        IUserRepository userRepository,
        ICurrentUserContext currentUser
    ) : IRequestHandler<UpdateUserSettingsCommand, Result>
    {
        public async Task<Result> Handle(UpdateUserSettingsCommand request, CancellationToken ct)
        {
            if (!currentUser.IsAuthenticated || string.IsNullOrWhiteSpace(currentUser.UserId))
                return Result.Failure("Unauthorized", ErrorType.Unauthorized);

            var userIdResult = EntityId.Create(currentUser.UserId);
            if (userIdResult.IsFailure)
                return Result.Failure("Invalid user id", ErrorType.Validation);

            var user = await userRepository.GetUserByIdAsync(userIdResult.Value, ct);
            if (user == null)
                return Result.Failure("User not found", ErrorType.NotFound);

            user.UpdateWeightDropThreshold(request.WeightDropThreshold);

            await userRepository.UpdateUserAsync(user, ct);

            return Result.Success();
        }
    }
}
