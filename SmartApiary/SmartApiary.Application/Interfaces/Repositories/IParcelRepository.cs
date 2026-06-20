using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface IParcelRepository
    {
        Task<Parcel?> GetByIdAsync(EntityId parcelId, CancellationToken ct = default);
        Task<Parcel?> GetByIdAsync(EntityId farmerId, EntityId parcelId, CancellationToken ct = default);
        Task<IReadOnlyCollection<Parcel>> GetByFarmerIdAsync(EntityId farmerId, CancellationToken ct = default);
        Task SaveAsync(Parcel parcel, CancellationToken ct = default);
        Task UpdateAsync(Parcel parcel, CancellationToken ct = default);
        Task DeleteAsync(Parcel parcel, CancellationToken ct = default);
        Task<IReadOnlyCollection<Parcel>> GetParcelsWithinRadiusAsync(double latitude, double longitude, double radiusInMeters, CancellationToken ct = default);
    }
}
