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
    internal class SprinklingRecordRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<SprinklingRecord> recordKeyProvider,
        ITableMapper<SprinklingRecord, SprinklingRecordEntity> recordMapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<SprinklingRecord, SprinklingRecordEntity>(
            tableServiceClient.GetTableClient(options.Value.SprinklingRecordsTable),
            recordKeyProvider,
            recordMapper
        ), ISprinklingRecordRepository
    {
        public async Task<SprinklingRecord?> GetByIdAsync(EntityId announcementId, EntityId recordId, CancellationToken ct = default)
        {
            return await base.GetByIdAsync(announcementId.Value, recordId.Value, ct);
        }

        public async Task<IReadOnlyCollection<SprinklingRecord>> GetByAnnouncementIdAsync(EntityId announcementId, CancellationToken ct = default)
        {
            return await base.QueryByPartitionKeyAsync(announcementId.Value, ct);
        }

        public async Task SaveAsync(SprinklingRecord record, CancellationToken ct = default)
        {
            await base.AddAsync(record, ct);
        }

        public new async Task UpdateAsync(SprinklingRecord record, CancellationToken ct = default)
        {
            await base.UpdateAsync(record, ct);
        }

        public new async Task DeleteAsync(SprinklingRecord record, CancellationToken ct = default)
        {
            await base.DeleteAsync(record, ct);
        }
    }
}
