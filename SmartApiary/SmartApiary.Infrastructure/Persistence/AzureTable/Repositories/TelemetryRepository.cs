using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using System.Linq;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Repositories
{
    internal class TelemetryRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<Telemetry> telemetryKeyProvider,
        ITableMapper<Telemetry, TelemetryEntity> telemetryMapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<Telemetry, TelemetryEntity>(
            tableServiceClient.GetTableClient(options.Value.TelemetriesTable),
            telemetryKeyProvider,
            telemetryMapper
        ), ITelemetryRepository
    {
        public async Task<Telemetry?> GetByIdAsync(EntityId smartScaleId, EntityId telemetryId, CancellationToken ct = default)
        {
            return await base.GetByIdAsync(smartScaleId.Value, telemetryId.Value, ct);
        }

        public async Task<IReadOnlyCollection<Telemetry>> GetBySmartScaleIdAsync(EntityId smartScaleId, CancellationToken ct = default)
        {
            return await base.QueryByPartitionKeyAsync(smartScaleId.Value, ct);
        }

        public async Task<Telemetry?> GetLatestBySmartScaleIdAsync(EntityId smartScaleId, CancellationToken ct = default)
        {
            var items = await base.QueryByPartitionKeyAsync(smartScaleId.Value, ct);
            return items.OrderByDescending(item => item.Timestamp).FirstOrDefault();
        }

        public async Task SaveAsync(Telemetry telemetry, CancellationToken ct = default)
        {
            await base.AddAsync(telemetry, ct);
        }
    }
}
