using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Repositories
{
    internal class SmartScaleRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<SmartScale> smartScaleKeyProvider,
        ITableMapper<SmartScale, SmartScaleEntity> smartScaleMapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<SmartScale, SmartScaleEntity>(
            tableServiceClient.GetTableClient(options.Value.SmartScalesTable),
            smartScaleKeyProvider,
            smartScaleMapper
        ), ISmartScaleRepository
    {
        public async Task<SmartScale?> GetByIdAsync(EntityId smartScaleId, CancellationToken ct = default)
        {
            var results = await base.QueryAsync($"RowKey eq '{smartScaleId.Value}'", ct);
            return results.FirstOrDefault();
        }

        public async Task<SmartScale?> GetBySerialNumberAsync(string serialNumber, CancellationToken ct = default)
        {
            var results = await base.QueryAsync($"SerialNumber eq '{serialNumber}'", ct);
            return results.FirstOrDefault();
        }

        public async Task<SmartScale?> GetByDeviceTokenAsync(string deviceToken, CancellationToken ct = default)
        {
            var results = await base.QueryAsync($"DeviceToken eq '{deviceToken}'", ct);
            return results.FirstOrDefault();
        }

        public async Task<IReadOnlyCollection<SmartScale>> GetByStatusAsync(DeviceStatusEnum status, CancellationToken ct = default)
        {
            return await base.QueryByPartitionKeyAsync(status.ToString(), ct);
        }

        public async Task SaveAsync(SmartScale smartScale, CancellationToken ct = default)
        {
            await base.AddAsync(smartScale, ct);
        }

        public new async Task UpdateAsync(SmartScale smartScale, CancellationToken ct = default)
        {
            await base.UpdateAsync(smartScale, ct);
        }

        public new async Task DeleteAsync(SmartScale smartScale, CancellationToken ct = default)
        {
            await base.DeleteAsync(smartScale, ct);
        }
    }
}
