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
    internal class CropRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<Crop> cropKeyProvider,
        ITableMapper<Crop, CropEntity> cropMapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<Crop, CropEntity>(
            tableServiceClient.GetTableClient(options.Value.CropsTable),
            cropKeyProvider,
            cropMapper
        ), ICropRepository
    {
        public async Task<Crop?> GetByIdAsync(EntityId parcelId, EntityId cropId, CancellationToken ct = default)
        {
            return await base.GetByIdAsync(parcelId.Value, cropId.Value, ct);
        }

        public async Task<IReadOnlyCollection<Crop>> GetByParcelIdAsync(EntityId parcelId, CancellationToken ct = default)
        {
            return await base.QueryByPartitionKeyAsync(parcelId.Value, ct);
        }

        public async Task SaveAsync(Crop crop, CancellationToken ct = default)
        {
            await base.AddAsync(crop, ct);
        }

        public async Task UpdateAsync(Crop crop, CancellationToken ct = default)
        {
            await base.UpdateAsync(crop, ct);
        }

        public async Task DeleteAsync(Crop crop, CancellationToken ct = default)
        {
            await base.DeleteAsync(crop, ct);
        }
    }
}
