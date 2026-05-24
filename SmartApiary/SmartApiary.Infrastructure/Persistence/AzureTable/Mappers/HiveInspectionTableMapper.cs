using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class HiveInspectionTableMapper : ITableMapper<HiveInspection, HiveInspectionEntity>
    {
        public HiveInspectionEntity ToEntity(HiveInspection domain)
        {
            return new HiveInspectionEntity
            {
                InspectionDate = domain.InspectionDate,
                BottomBoardColor = domain.BottomBoardColor,
                HoneyFrames = domain.HoneyFrames,
                HoneyAmount = domain.HoneyAmount,
                BroodFrames = domain.BroodFrames,
                QueenPresent = domain.QueenPresent,
                Note = domain.Note,
                HiveId = domain.HiveId.Value
            };
        }

        public HiveInspection? ToDomain(HiveInspectionEntity entity)
        {
            var hiveInspectionResult = HiveInspection.Load(
                entity.RowKey,
                entity.InspectionDate,
                entity.BottomBoardColor,
                entity.HoneyFrames,
                entity.HoneyAmount,
                entity.BroodFrames,
                entity.QueenPresent,
                entity.Note,
                entity.HiveId
            );

            if (hiveInspectionResult.IsFailure)
                return null;

            return hiveInspectionResult.Value;
        }
    }
}
