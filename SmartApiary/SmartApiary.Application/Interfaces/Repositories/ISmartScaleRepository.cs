using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface ISmartScaleRepository
    {
        Task<SmartScale?> GetByIdAsync(EntityId smartScaleId, CancellationToken ct = default);
        Task<SmartScale?> GetBySerialNumberAsync(string serialNumber, CancellationToken ct = default);
        Task<SmartScale?> GetByDeviceTokenAsync(string deviceToken, CancellationToken ct = default);
        Task<IReadOnlyCollection<SmartScale>> GetByStatusAsync(DeviceStatusEnum status, CancellationToken ct = default);
        Task SaveAsync(SmartScale smartScale, CancellationToken ct = default);
        Task UpdateAsync(SmartScale smartScale, CancellationToken ct = default);
        Task DeleteAsync(SmartScale smartScale, CancellationToken ct = default);
    }
}
