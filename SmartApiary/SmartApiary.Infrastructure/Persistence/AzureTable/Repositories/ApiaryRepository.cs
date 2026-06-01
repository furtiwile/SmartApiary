using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Repositories
{
    internal class ApiaryRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<Apiary> apiaryKeyProvider,
        ITableMapper<Apiary, ApiaryEntity> apiaryMapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<Apiary, ApiaryEntity>(
            tableServiceClient.GetTableClient(options.Value.ApiariesTable),
            apiaryKeyProvider,
            apiaryMapper
        ), IApiaryRepository
    {
        public async Task<IReadOnlyCollection<Apiary>> GetAllAsync(CancellationToken ct = default)
        {
            return await base.QueryAsync(string.Empty, ct);
        }

        public async Task<Apiary?> GetByIdAsync(EntityId beekeeperId, EntityId apiaryId, CancellationToken ct = default)
        {
            return await base.GetByIdAsync(beekeeperId.Value, apiaryId.Value, ct);
        }

        public async Task<IReadOnlyCollection<Apiary>> GetByBeekeeperIdAsync(EntityId beekeeperId, CancellationToken ct = default)
        {
            return await base.QueryByPartitionKeyAsync(beekeeperId.Value, ct);
        }

        public async Task SaveAsync(Apiary apiary, CancellationToken ct = default)
        {
            await base.AddAsync(apiary, ct);
        }

        public new async Task UpdateAsync(Apiary apiary, CancellationToken ct = default)
        {
            await base.UpdateAsync(apiary, ct);
        }

        public new async Task DeleteAsync(Apiary apiary, CancellationToken ct = default)
        {
            await base.DeleteAsync(apiary, ct);
        }
    }
}
