using FluentValidation;
using MediatR;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Common.Models;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Auth.Commands
{
    public record RequestPasswordResetCommand(string Email) : IRequest<Result<string?>>;

    public class RequestPasswordResetValidator : AbstractValidator<RequestPasswordResetCommand>
    {
        public RequestPasswordResetValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
        }
    }

    internal class RequestPasswordResetHandler(
        IUserRepository userRepository,
        IOneTimeTokenService tokenService,
        IPasswordResetTokenRepository resetRepo,
        IEmailSender emailSender,
        IEmailLinkProvider linkProvider,
        IUserTokenSettings tokenSettings,
        IDateTimeProvider dateTimeProvider
    ) : IRequestHandler<RequestPasswordResetCommand, Result<string?>>
    {
        public async Task<Result<string?>> Handle(RequestPasswordResetCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailAsync(request.Email, cancellationToken);
            if (user == null)
                return Result<string?>.Failure("If the email exists, a reset link will be sent.");

            var oneTime = tokenService.GenerateToken();
            var expires = dateTimeProvider.UtcNow.AddMinutes(tokenSettings.ResetTokenMinutes);
            var resetResult = PasswordResetToken.Create(user.Id, oneTime.TokenHash, expires);
            if (resetResult.IsFailure)
                return Result<string?>.Failure("Unable to create reset token");

            await resetRepo.SaveAsync(resetResult.Value, cancellationToken);

            var rawToken = oneTime.RawToken;
            var link = linkProvider.BuildResetLink(rawToken);

            var email = new EmailMessage(user.Email, "Reset your SmartApiary password", $"<p>Reset password: <a href=\"{link}\">link</a></p>", $"Reset: {link}");
            _ = emailSender.SendAsync(email, cancellationToken);

            return Result<string?>.Success(linkProvider.ReturnLinkInResponse ? link : null);
        }
    }

    public record ResetPasswordCommand(string Token, string Password) : IRequest<Result>;

    public class ResetPasswordValidator : AbstractValidator<ResetPasswordCommand>
    {
        public ResetPasswordValidator()
        {
            RuleFor(x => x.Token).NotEmpty();
            RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        }
    }

    internal class ResetPasswordHandler(
        IOneTimeTokenService tokenService,
        IPasswordResetTokenRepository resetRepo,
        IUserRepository userRepository,
        IDateTimeProvider dateTimeProvider
    ) : IRequestHandler<ResetPasswordCommand, Result>
    {
        public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            var hash = tokenService.HashToken(request.Token);
            var token = await resetRepo.GetByTokenHashAsync(hash, cancellationToken);
            if (token == null)
                return Result.Failure("Invalid or expired token");

            if (token.UsedAtUtc != null)
                return Result.Failure("Token already used");

            if (token.ExpiresAtUtc < dateTimeProvider.UtcNow)
                return Result.Failure("Token expired");

            var user = await userRepository.GetUserByIdAsync(token.UserId, cancellationToken);
            if (user == null)
                return Result.Failure("User not found");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            // keep active state as-is
            await userRepository.UpadateUserAsync(user, cancellationToken);

            token.UsedAtUtc = dateTimeProvider.UtcNow;
            await resetRepo.UpdateAsync(token, cancellationToken);

            return Result.Success();
        }
    }
}
