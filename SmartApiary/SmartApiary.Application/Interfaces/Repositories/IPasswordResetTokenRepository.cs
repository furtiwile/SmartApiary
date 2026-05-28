using SmartApiary.Domain.Models;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface IPasswordResetTokenRepository
    {
        Task<PasswordResetToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default);
        Task SaveAsync(PasswordResetToken token, CancellationToken ct = default);
        Task UpdateAsync(PasswordResetToken token, CancellationToken ct = default);
    }
}
