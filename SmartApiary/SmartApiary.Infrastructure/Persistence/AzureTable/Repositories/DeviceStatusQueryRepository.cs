using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;
using System.Runtime.CompilerServices;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Repositories
{
/* TODO: DELETE
    internal class DeviceStatusQueryRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<DeviceStatus> deviceStatusKeyProvider,
        ITableMapper<DeviceStatus, DeviceStatusEntity> statusMapper,
        IOptions<AzureTableOptions> options)
        : AzureTableRepository<DeviceStatus, DeviceStatusEntity>(
            tableServiceClient.GetTableClient(options.Value.DeviceStatusesTable),
            deviceStatusKeyProvider,
            statusMapper), IDeviceStatusQueryRepository
    {
        public async Task<IReadOnlyCollection<DeviceStatus>> GetAllAsync(CancellationToken ct = default)
        {
            return await base.QueryAsync(string.Empty, ct);
        }

        public async Task<DeviceStatus?> GetByIdAsync(DeviceType type, EntityId deviceId, CancellationToken ct = default)
        {
            return await base.GetByIdAsync(type.ToString(), deviceId, ct);
        }

        public async Task<IReadOnlyCollection<DeviceStatus>> GetByTypeAsync(DeviceType type, CancellationToken ct = default)
        {
            return await base.QueryByPartitionKeyAsync(type.ToString(), ct);
        }

        public async IAsyncEnumerable<DeviceStatus> GetByTypeStreamingAsync(DeviceType type, [EnumeratorCancellation] CancellationToken ct = default)
        {
            var partitionKey = type.ToString();

            var query = _tableClient.QueryAsync<DeviceStatusEntity>(
                filter: $"PartitionKey eq '{partitionKey}'",
                cancellationToken: ct);

            await foreach (var entity in query.WithCancellation(ct))
            {
                var domainModel = base._mapper.ToDomain(entity);

                if (domainModel is null)
                    continue;

                yield return domainModel;
            }
        }
    }
*/
}
