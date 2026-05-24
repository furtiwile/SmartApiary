using SmartApiary.Domain.Common;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class ApiaryTableMapper : ITableMapper<Apiary, ApiaryEntity>
    {
        public ApiaryEntity ToEntity(Apiary domain)
        {
            return new ApiaryEntity
            {
                Name = domain.Name,
                Latitude = domain.Latitude,
                Longitude = domain.Longitude,
                Description = domain.Description,
                ImageUrl = domain.ImageUrl,
                ThumbnailUrl = domain.ThumbnailUrl,
                BeekeeperId = domain.BeekeeperId.Value
            };
        }

        public Apiary? ToDomain(ApiaryEntity entity)
        {
            var apiaryResult = Apiary.Load(
                entity.RowKey,
                entity.Name,
                entity.Latitude,
                entity.Longitude,
                entity.Description,
                entity.ImageUrl,
                entity.ThumbnailUrl,
                entity.BeekeeperId
            );

            if (apiaryResult.IsFailure)
                return null;

            return apiaryResult.Value;
        }

    }
}
