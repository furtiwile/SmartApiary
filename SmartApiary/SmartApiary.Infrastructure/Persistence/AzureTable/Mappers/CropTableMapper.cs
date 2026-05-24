using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class CropTableMapper : ITableMapper<Crop, CropEntity>
    {
        public CropEntity ToEntity(Crop domain)
        {
            return new CropEntity
            {
                Type = domain.Type.ToString(),
                ExpectedFloweringTime = domain.ExpectedFloweringTime,
                Note = domain.Note,
                ParcelId = domain.ParcelId.Value
            };
        }

        public Crop? ToDomain(CropEntity entity)
        {
            var type = Enum.TryParse<CropType>(entity.PartitionKey, out var parsedType)
                ? parsedType
                : CropType.Other;

            var cropResult = Crop.Load(
                entity.RowKey,
                type,
                entity.ExpectedFloweringTime,
                entity.Note,
                entity.ParcelId
            );

            if (cropResult.IsFailure)
                return null;

            return cropResult.Value;
        }
    }
}
