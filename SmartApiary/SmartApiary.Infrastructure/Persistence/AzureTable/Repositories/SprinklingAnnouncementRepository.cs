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
    internal class SprinklingAnnouncementRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<SprinklingAnnouncement> announcementKeyProvider,
        ITableMapper<SprinklingAnnouncement, SprinklingAnnouncementEntity> announcementMapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<SprinklingAnnouncement, SprinklingAnnouncementEntity>(
            tableServiceClient.GetTableClient(options.Value.SprinklingAnnouncementsTable),
            announcementKeyProvider,
            announcementMapper
        ), ISprinklingAnnouncementRepository
    {
        public async Task<SprinklingAnnouncement?> GetByIdAsync(EntityId parcelId, EntityId announcementId, CancellationToken ct = default)
        {
            return await base.GetByIdAsync(parcelId.Value, announcementId.Value, ct);
        }

        public async Task<IReadOnlyCollection<SprinklingAnnouncement>> GetByParcelIdAsync(EntityId parcelId, CancellationToken ct = default)
        {
            return await base.QueryByPartitionKeyAsync(parcelId.Value, ct);
        }

        public async Task SaveAsync(SprinklingAnnouncement announcement, CancellationToken ct = default)
        {
            await base.AddAsync(announcement, ct);
        }

        public new async Task UpdateAsync(SprinklingAnnouncement announcement, CancellationToken ct = default)
        {
            await base.UpdateAsync(announcement, ct);
        }

        public new async Task DeleteAsync(SprinklingAnnouncement announcement, CancellationToken ct = default)
        {
            await base.DeleteAsync(announcement, ct);
        }
    }
}
