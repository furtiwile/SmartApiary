using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class PasswordResetToken : AggregateRoot
    {
        public string TokenHash { get; set; }
        public EntityId UserId { get; set; }
        public DateTime ExpiresAtUtc { get; set; }
        public DateTime? UsedAtUtc { get; set; }

        private PasswordResetToken(string tokenHash, EntityId userId, DateTime expiresAtUtc, DateTime? usedAtUtc)
        {
            TokenHash = tokenHash;
            UserId = userId;
            ExpiresAtUtc = expiresAtUtc;
            UsedAtUtc = usedAtUtc;
        }

        public static Result<PasswordResetToken> Create(EntityId userId, string tokenHash, DateTime expiresAtUtc)
        {
            if (userId == null || string.IsNullOrWhiteSpace(userId.Value))
                return Result<PasswordResetToken>.Failure("User id is required", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(tokenHash))
                return Result<PasswordResetToken>.Failure("Token hash is required", ErrorType.Validation);

            return Result<PasswordResetToken>.Success(new PasswordResetToken(tokenHash, userId, expiresAtUtc, null));
        }

        public static Result<PasswordResetToken> Load(string tokenHash, string userId, DateTime expiresAtUtc, DateTime? usedAtUtc)
        {
            var userIdResult = EntityId.Create(userId);
            if (userIdResult.IsFailure)
                return Result<PasswordResetToken>.Failure("Invalid user id", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(tokenHash))
                return Result<PasswordResetToken>.Failure("Token hash is required", ErrorType.Validation);

            return Result<PasswordResetToken>.Success(new PasswordResetToken(tokenHash, userIdResult.Value, expiresAtUtc, usedAtUtc));
        }
    }
}
