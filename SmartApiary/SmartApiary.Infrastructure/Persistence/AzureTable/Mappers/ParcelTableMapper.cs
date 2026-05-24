using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class ParcelTableMapper : ITableMapper<Parcel, ParcelEntity>
    {
        public ParcelEntity ToEntity(Parcel domain)
        {
            return new ParcelEntity
            {
                Name = domain.Name,
                Latitude = domain.Latitude,
                Longitude = domain.Longitude,
                FarmerId = domain.FarmerId.Value
            };
        }

        public Parcel? ToDomain(ParcelEntity entity)
        {
            var parcelResult = Parcel.Load(
                entity.RowKey,
                entity.Name,
                entity.Latitude,
                entity.Longitude,
                entity.FarmerId
            );

            if (parcelResult.IsFailure)
                return null;

            return parcelResult.Value;

        }
    }
}
