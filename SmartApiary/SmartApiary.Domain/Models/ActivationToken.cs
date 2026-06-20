using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class ActivationToken : AggregateRoot
    {
        public string TokenHash { get; private set; }
        public EntityId UserId { get; private set; }
        public DateTime ExpiresAtUtc { get; private set; }
        public DateTime? UsedAtUtc { get; private set; }

        public void MarkAsUsed(DateTime usedAtUtc)
        {
            UsedAtUtc = usedAtUtc;
        }

        private ActivationToken(
            string tokenHash,
            EntityId userId,
            DateTime expiresAtUtc,
            DateTime? usedAtUtc)
        {
            TokenHash = tokenHash;
            UserId = userId;
            ExpiresAtUtc = expiresAtUtc;
            UsedAtUtc = usedAtUtc;
        }

        public static Result<ActivationToken> Create(
            EntityId userId,
            string tokenHash,
            DateTime expiresAtUtc)
        {
            if (userId == null || string.IsNullOrWhiteSpace(userId.Value))
                return Result<ActivationToken>.Failure("User id is required", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(tokenHash))
                return Result<ActivationToken>.Failure("Token hash is required", ErrorType.Validation);

            return Result<ActivationToken>.Success(
                new ActivationToken(tokenHash, userId, expiresAtUtc, null));
        }

        public static Result<ActivationToken> Load(
            string tokenHash,
            string userId,
            DateTime expiresAtUtc,
            DateTime? usedAtUtc)
        {
            var userIdResult = EntityId.Create(userId);
            if (userIdResult.IsFailure)
                return Result<ActivationToken>.Failure("Invalid user id", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(tokenHash))
                return Result<ActivationToken>.Failure("Token hash is required", ErrorType.Validation);

            return Result<ActivationToken>.Success(
                new ActivationToken(tokenHash, userIdResult.Value, expiresAtUtc, usedAtUtc));
        }
    }
}
