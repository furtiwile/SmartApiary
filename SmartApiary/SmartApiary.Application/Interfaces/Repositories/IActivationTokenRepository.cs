using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface IActivationTokenRepository
    {
        Task<ActivationToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default);
        Task SaveAsync(ActivationToken token, CancellationToken ct = default);
        Task UpdateAsync(ActivationToken token, CancellationToken ct = default);
    }
}
