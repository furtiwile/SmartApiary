using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces;
using SmartApiary.Domain.Common;

namespace SmartApiary.Application.Features.Auth.Commands
{
    public record ActivateAccountCommand(string Token, string Password) : IRequest<Result>;

    public class ActivateAccountValidator : AbstractValidator<ActivateAccountCommand>
    {
        public ActivateAccountValidator()
        {
            RuleFor(x => x.Token).NotEmpty();
            RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        }
    }

    internal class ActivateAccountHandler(
        IOneTimeTokenService tokenService,
        IActivationTokenRepository activationRepo,
        IUserRepository userRepository,
        IDateTimeProvider dateTimeProvider
    ) : IRequestHandler<ActivateAccountCommand, Result>
    {
        public async Task<Result> Handle(ActivateAccountCommand request, CancellationToken cancellationToken)
        {
            var hash = tokenService.HashToken(request.Token);
            var token = await activationRepo.GetByTokenHashAsync(hash, cancellationToken);
            if (token == null)
                return Result.Failure("Invalid or expired token");

            if (token.UsedAtUtc != null)
                return Result.Failure("Token already used");

            if (token.ExpiresAtUtc < dateTimeProvider.UtcNow)
                return Result.Failure("Token expired");

            var user = await userRepository.GetUserByIdAsync(token.UserId, cancellationToken);
            if (user == null)
                return Result.Failure("User not found");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            user.Activate(passwordHash);

            await userRepository.UpadateUserAsync(user, cancellationToken);

            token.MarkAsUsed(dateTimeProvider.UtcNow);
            await activationRepo.UpdateAsync(token, cancellationToken);

            return Result.Success();
        }
    }
}
