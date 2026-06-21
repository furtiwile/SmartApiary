using SmartApiary.Application.Features.SprinklingRecords.Queries;

namespace SmartApiary.Application.Interfaces
{
    public interface IPdfService
    {
        Task<byte[]> GenerateSprinklingReportAsync(IReadOnlyCollection<SprinklingRecordDto> records, CancellationToken ct = default);
    }
}