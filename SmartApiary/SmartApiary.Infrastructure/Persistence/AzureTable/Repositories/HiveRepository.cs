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
    internal class HiveRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<Hive> hiveKeyProvider,
        ITableMapper<Hive, HiveEntity> hiveMapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<Hive, HiveEntity>(
            tableServiceClient.GetTableClient(options.Value.HivesTable),
            hiveKeyProvider,
            hiveMapper
        ), IHiveRepository
    {
        public async Task<Hive?> GetByIdAsync(EntityId hiveId, CancellationToken ct = default)
        {
            var results = await base.QueryAsync($"RowKey eq '{hiveId.Value}'", ct);
            return results.FirstOrDefault();
        }

        public async Task<Hive?> GetByIdAsync(EntityId apiaryId, EntityId hiveId, CancellationToken ct = default)
        {
            return await base.GetByIdAsync(apiaryId.Value, hiveId.Value, ct);
        }

        public async Task<IReadOnlyCollection<Hive>> GetByApiaryIdAsync(EntityId apiaryId, CancellationToken ct = default)
        {
            var lowerCaseHives = await base.QueryByPartitionKeyAsync(apiaryId.Value.ToLowerInvariant(), ct);
            var upperCaseHives = await base.QueryByPartitionKeyAsync(apiaryId.Value.ToUpperInvariant(), ct);
            
            var originalCaseHives = await base.QueryByPartitionKeyAsync(apiaryId.Value, ct);

            return lowerCaseHives
                .Concat(upperCaseHives)
                .Concat(originalCaseHives)
                .GroupBy(h => h.Id.Value)
                .Select(g => g.First())
                .ToList();
        }

        public async Task SaveAsync(Hive hive, CancellationToken ct = default)
        {
            await base.AddAsync(hive, ct);
        }

        public new async Task UpdateAsync(Hive hive, CancellationToken ct = default)
        {
            await base.UpdateAsync(hive, ct);
        }

        public new async Task DeleteAsync(Hive hive, CancellationToken ct = default)
        {
            await base.DeleteAsync(hive, ct);
        }

        public async Task<Hive?> GetBySmartScaleIdAsync(EntityId smartScaleId, CancellationToken ct = default)
        {

            var filter = $"SmartScaleId eq '{smartScaleId.Value}'";

            var entities = await base.QueryAsync(filter, ct);

            return entities.FirstOrDefault();

        }
    }
}
