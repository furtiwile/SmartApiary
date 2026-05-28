using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class PasswordResetTokenTableMapper : ITableMapper<PasswordResetToken, PasswordResetTokenEntity>
    {
        public PasswordResetTokenEntity ToEntity(PasswordResetToken domain)
        {
            return new PasswordResetTokenEntity
            {
                TokenHash = domain.TokenHash,
                UserId = domain.UserId.Value,
                ExpiresAtUtc = domain.ExpiresAtUtc,
                UsedAtUtc = domain.UsedAtUtc
            };
        }

        public PasswordResetToken? ToDomain(PasswordResetTokenEntity entity)
        {
            var result = PasswordResetToken.Load(
                entity.TokenHash,
                entity.UserId,
                entity.ExpiresAtUtc,
                entity.UsedAtUtc);

            return result.IsFailure ? null : result.Value;
        }
    }
}
