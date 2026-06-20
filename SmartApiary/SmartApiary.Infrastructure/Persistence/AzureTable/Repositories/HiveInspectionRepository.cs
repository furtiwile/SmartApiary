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
    internal class HiveInspectionRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<HiveInspection> inspectionKeyProvider,
        ITableMapper<HiveInspection, HiveInspectionEntity> inspectionMapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<HiveInspection, HiveInspectionEntity>(
            tableServiceClient.GetTableClient(options.Value.HiveInspectionsTable),
            inspectionKeyProvider,
            inspectionMapper
        ), IHiveInspectionRepository
    {
        public async Task<HiveInspection?> GetByIdAsync(EntityId hiveId, EntityId inspectionId, CancellationToken ct = default)
        {
            return await base.GetByIdAsync(hiveId.Value, inspectionId.Value, ct);
        }

        public async Task<IReadOnlyCollection<HiveInspection>> GetByHiveIdAsync(EntityId hiveId, int pageNumber = 1, int pageSize = 10, CancellationToken ct = default)
        {
            var results = await base.QueryByPartitionKeyAsync(hiveId.Value, ct);
            return results
                .OrderByDescending(x => x.InspectionDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();
        }

        public async Task SaveAsync(HiveInspection inspection, CancellationToken ct = default)
        {
            await base.AddAsync(inspection, ct);
        }

        public new async Task UpdateAsync(HiveInspection inspection, CancellationToken ct = default)
        {
            await base.UpdateAsync(inspection, ct);
        }

        public new async Task DeleteAsync(HiveInspection inspection, CancellationToken ct = default)
        {
            await base.DeleteAsync(inspection, ct);
        }
    }
}
