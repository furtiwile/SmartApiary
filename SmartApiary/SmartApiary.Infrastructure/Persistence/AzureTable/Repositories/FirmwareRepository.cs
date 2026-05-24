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
/* TODO: DELETE
    internal class FirmwareRepository(
            TableServiceClient tableServiceClient,
            ITableKeyProvider<Firmware> keyProvider,
            ITableMapper<Firmware, FirmwareEntity> mapper,
            IOptions<AzureTableOptions> options
    ) : AzureTableRepository<Firmware, FirmwareEntity>(
              tableServiceClient.GetTableClient(options.Value.FirmwaresTable),
              keyProvider,
              mapper),
        IFirmwareRepository
    {
        public async Task SaveAsync(Firmware firmware, CancellationToken ct)
        {
            await base.AddAsync(firmware, ct);
        }
        public async Task<FirmwareVersion?> GetLatestVersionAsync(DeviceType deviceType, CancellationToken ct)
        {
            var firmwares = await base.QueryByPartitionKeyAsync(deviceType.ToString(), ct);

            var latest = firmwares
                    .Select(f => f.Version)
                    .OrderByDescending(v => v, Comparer<FirmwareVersion>.Create((a, b) => a.CompareTo(b)))
                    .FirstOrDefault();

            return latest;
        }
    }
*/
}
