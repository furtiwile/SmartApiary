using SmartApiary.Application.Common;
using SmartApiary.Application.Features.Apiaries;
using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Storage
{
    public interface IApiaryImageStorage
    {
        Task<Result<ApiaryImageUploadResult>> SaveAsync(EntityId apiaryId, UploadedApiaryImageFile file, CancellationToken ct = default);
        Task DeleteAsync(EntityId apiaryId, CancellationToken ct = default);
    }
}