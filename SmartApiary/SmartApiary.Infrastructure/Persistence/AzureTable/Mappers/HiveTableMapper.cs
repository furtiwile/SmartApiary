using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class HiveTableMapper : ITableMapper<Hive, HiveEntity>
    {
        public HiveEntity ToEntity(Hive domain)
        {
            return new HiveEntity
            {
                Designation = domain.Designation,
                Type = domain.Type.ToString(),
                SuperColor = domain.SuperColor,
                QueenAge = domain.QueenAge,
                Note = domain.Note,
                ApiaryId = domain.ApiaryId.Value,
                SmartScaleId = domain.SmartScaleId.Value
            };
        }

        public Hive? ToDomain(HiveEntity entity)
        {
            var type = Enum.TryParse<HiveType>(entity.Type, out var parsedType)
                ? parsedType
                : HiveType.Other;

            var hiveResult = Hive.Load(
                entity.RowKey,
                entity.Designation,
                type,
                entity.SuperColor,
                entity.QueenAge,
                entity.Note,
                entity.ApiaryId,
                entity.SmartScaleId
            );

            if (hiveResult.IsFailure)
                return null;

            return hiveResult.Value;
        }
    }
}
