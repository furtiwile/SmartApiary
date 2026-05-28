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
    internal class ActivationTokenRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<ActivationToken> keyProvider,
        ITableMapper<ActivationToken, ActivationTokenEntity> mapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<ActivationToken, ActivationTokenEntity>(
            tableServiceClient.GetTableClient(options.Value.ActivationTokensTable),
            keyProvider,
            mapper
        ), IActivationTokenRepository
    {
        public async Task<ActivationToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(tokenHash))
                return null;

            return await base.GetByIdAsync(ActivationTokenTableKeyProvider.Partition, tokenHash, ct);
        }

        public async Task SaveAsync(ActivationToken token, CancellationToken ct = default)
        {
            await base.AddAsync(token, ct);
        }

        public async Task UpdateAsync(ActivationToken token, CancellationToken ct = default)
        {
            await base.UpdateAsync(token, ct);
        }
    }
}
