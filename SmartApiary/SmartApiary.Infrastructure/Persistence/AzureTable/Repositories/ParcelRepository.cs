using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;
using System.Linq;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Repositories
{
    internal class ParcelRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<Parcel> parcelKeyProvider,
        ITableMapper<Parcel, ParcelEntity> parcelMapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<Parcel, ParcelEntity>(
            tableServiceClient.GetTableClient(options.Value.ParcelsTable),
            parcelKeyProvider,
            parcelMapper
        ), IParcelRepository
    {
        public async Task<Parcel?> GetByIdAsync(EntityId parcelId, CancellationToken ct = default)
        {
            var results = await base.QueryAsync($"RowKey eq '{parcelId.Value}'", ct);
            return results.FirstOrDefault();
        }

        public async Task<Parcel?> GetByIdAsync(EntityId farmerId, EntityId parcelId, CancellationToken ct = default)
        {
            return await base.GetByIdAsync(farmerId.Value, parcelId.Value, ct);
        }

        public async Task<IReadOnlyCollection<Parcel>> GetByFarmerIdAsync(EntityId farmerId, CancellationToken ct = default)
        {
            return await base.QueryByPartitionKeyAsync(farmerId.Value, ct);
        }

        public async Task SaveAsync(Parcel parcel, CancellationToken ct = default)
        {
            await base.AddAsync(parcel, ct);
        }

        public async Task UpdateAsync(Parcel parcel, CancellationToken ct = default)
        {
            await base.UpdateAsync(parcel, ct);
        }

        public async Task DeleteAsync(Parcel parcel, CancellationToken ct = default)
        {
            await base.DeleteAsync(parcel, ct);
        }
    }
}
