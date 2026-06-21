using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Auth.Commands
{
    public record SuspendUserCommand(string UserId) : IRequest<Result>;

    public class SuspendUserValidator : AbstractValidator<SuspendUserCommand>
    {
        public SuspendUserValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("User ID is required");
        }
    }

    internal class SuspendUserHandler(IUserRepository userRepository)
        : IRequestHandler<SuspendUserCommand, Result>
    {
        public async Task<Result> Handle(SuspendUserCommand request, CancellationToken ct)
        {
            var idResult = EntityId.Create(request.UserId);
            if (idResult.IsFailure)
                return Result.Failure("Invalid user id");

            var user = await userRepository.GetUserByIdAsync(idResult.Value, ct);
            if (user == null)
                return Result.Failure("User not found");

            user.ToggleActive();

            await userRepository.UpdateUserAsync(user, ct);

            return Result.Success();
        }
    }
}
