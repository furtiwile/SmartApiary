using SmartApiary.Application.Features.SprinklingRecords.Queries;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace SmartApiary.Application.Interfaces
{
    public interface IPdfService
    {
        Task<byte[]> GenerateSprinklingReportAsync(IReadOnlyCollection<SprinklingRecordDto> records, CancellationToken ct = default);
    }
}