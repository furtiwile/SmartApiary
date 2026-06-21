using FluentValidation;
using MediatR;
using SmartApiary.Application.Common.Models;
using SmartApiary.Application.Interfaces;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Features.Auth.Commands
{
    public record AdminCreateUserCommand : IRequest<Result<AdminCreateUserResponse>>
    {
        public string Email { get; init; } = string.Empty;
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public string PhoneNumber { get; init; } = string.Empty;
        public RoleType Role { get; init; } = RoleType.Beekeeper;
    }

    public record AdminCreateUserResponse(string UserId, string? ActivationLink = null);

    public class AdminCreateUserValidator : AbstractValidator<AdminCreateUserCommand>
    {
        public AdminCreateUserValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.FirstName).NotEmpty();
            RuleFor(x => x.LastName).NotEmpty();
            RuleFor(x => x.PhoneNumber).NotEmpty();
        }
    }

    internal class AdminCreateUserHandler(
        IUserRepository userRepository,
        IOneTimeTokenService tokenService,
        IActivationTokenRepository activationRepo,
        IEmailSender emailSender,
        IEmailLinkProvider linkProvider,
        IUserTokenSettings tokenSettings,
        IDateTimeProvider dateTimeProvider
    ) : IRequestHandler<AdminCreateUserCommand, Result<AdminCreateUserResponse>>
    {
        public async Task<Result<AdminCreateUserResponse>> Handle(AdminCreateUserCommand request, CancellationToken cancellationToken)
        {
            var existing = await userRepository.GetUserByEmailAsync(request.Email, cancellationToken);
            if (existing != null)
                return Result<AdminCreateUserResponse>.Failure("Email already in use");

            // create user with temporary password and inactive
            var tempPassword = Guid.NewGuid().ToString();
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword);

            var userResult = User.Create(request.Email, request.FirstName, request.LastName, request.PhoneNumber, passwordHash, request.Role, false);
            if (userResult.IsFailure)
                return Result<AdminCreateUserResponse>.Failure(userResult.Error!.Message);

            var user = userResult.Value;
            await userRepository.SaveUserAsync(user, cancellationToken);

            // generate activation token
            var oneTime = tokenService.GenerateToken();
            var expires = dateTimeProvider.UtcNow.AddMinutes(tokenSettings.ActivationTokenMinutes);
            var activationResult = ActivationToken.Create(user.Id, oneTime.TokenHash, expires);
            if (activationResult.IsFailure)
                return Result<AdminCreateUserResponse>.Failure(activationResult.Error!.Message);

            await activationRepo.SaveAsync(activationResult.Value, cancellationToken);

            var rawToken = oneTime.RawToken;
            var link = linkProvider.BuildActivationLink(rawToken);

            // send email (fire-and-forget)
            var email = new EmailMessage(
                user.Email,
                "Activate your SmartApiary account",
                $"<p>Please activate your account by clicking <a href=\"{link}\">here</a></p>",
                $"Activate your account: {link}"
            );

            _ = emailSender.SendAsync(email, cancellationToken);

            var response = new AdminCreateUserResponse(user.Id.Value, linkProvider.ReturnLinkInResponse ? link : null);

            return Result<AdminCreateUserResponse>.Success(response);
        }
    }
}
