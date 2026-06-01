using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;
using SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Repositories
{
    internal class PasswordResetTokenRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<PasswordResetToken> keyProvider,
        ITableMapper<PasswordResetToken, PasswordResetTokenEntity> mapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<PasswordResetToken, PasswordResetTokenEntity>(
            tableServiceClient.GetTableClient(options.Value.PasswordResetTokensTable),
            keyProvider,
            mapper
        ), IPasswordResetTokenRepository
    {
        public async Task<PasswordResetToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(tokenHash))
                return null;

            return await base.GetByIdAsync(PasswordResetTokenTableKeyProvider.Partition, tokenHash, ct);
        }

        public async Task SaveAsync(PasswordResetToken token, CancellationToken ct = default)
        {
            await base.AddAsync(token, ct);
        }

        public new async Task UpdateAsync(PasswordResetToken token, CancellationToken ct = default)
        {
            await base.UpdateAsync(token, ct);
        }
    }
}
