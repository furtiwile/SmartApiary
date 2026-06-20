using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Features.Auth.Commands
{
    public record DeleteUserCommand(string UserId) : IRequest<Result>;

    public class DeleteUserValidator : AbstractValidator<DeleteUserCommand>
    {
        public DeleteUserValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("User ID is required");
        }
    }

    internal class DeleteUserHandler(IUserRepository userRepository)
        : IRequestHandler<DeleteUserCommand, Result>
    {
        public async Task<Result> Handle(DeleteUserCommand request, CancellationToken ct)
        {
            var idResult = EntityId.Create(request.UserId);
            if (idResult.IsFailure)
                return Result.Failure("Invalid user id");

            var user = await userRepository.GetUserByIdAsync(idResult.Value, ct);
            if (user == null)
                return Result.Failure("User not found");

            await userRepository.DeleteUserAsync(user, ct);

            return Result.Success();
        }
    }
}
