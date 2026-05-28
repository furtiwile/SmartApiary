using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class ActivationTokenTableMapper : ITableMapper<ActivationToken, ActivationTokenEntity>
    {
        public ActivationTokenEntity ToEntity(ActivationToken domain)
        {
            return new ActivationTokenEntity
            {
                TokenHash = domain.TokenHash,
                UserId = domain.UserId.Value,
                ExpiresAtUtc = domain.ExpiresAtUtc,
                UsedAtUtc = domain.UsedAtUtc
            };
        }

        public ActivationToken? ToDomain(ActivationTokenEntity entity)
        {
            var result = ActivationToken.Load(
                entity.TokenHash,
                entity.UserId,
                entity.ExpiresAtUtc,
                entity.UsedAtUtc);

            return result.IsFailure ? null : result.Value;
        }
    }
}
