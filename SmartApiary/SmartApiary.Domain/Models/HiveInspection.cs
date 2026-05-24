using SmartApiary.Domain.Common;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Domain.Models
{
    public class HiveInspection
    {
        public EntityId Id { get; set; }
        public DateTime InspectionDate { get; set; }
        public string BottomBoardColor { get; set; }
        public int HoneyFrames { get; set; }
        public double HoneyAmount { get; set; }
        public int BroodFrames { get; set; }
        public bool QueenPresent { get; set; }
        public string Note { get; set; } = string.Empty;
        public EntityId HiveId { get; set; }

        /// <summary>
        /// Creates an instance of the hive inspection
        /// </summary>
        /// <param name="id"></param>
        /// <param name="inspectionDate"></param>
        /// <param name="bottomBoardColor"></param>
        /// <param name="honeyFrames"></param>
        /// <param name="honeyAmount"></param>
        /// <param name="broodFrames"></param>
        /// <param name="queenPresent"></param>
        /// <param name="note"></param>
        /// <param name="hiveId"></param>
        private HiveInspection(
            EntityId id, 
            DateTime inspectionDate, 
            string bottomBoardColor, 
            int honeyFrames, 
            double honeyAmount, 
            int broodFrames,
            bool queenPresent, 
            string note,
            EntityId hiveId
        )
        {
            Id = id;
            InspectionDate = inspectionDate;
            BottomBoardColor = bottomBoardColor;
            HoneyFrames = honeyFrames;
            HoneyAmount = honeyAmount;
            BroodFrames = broodFrames;
            QueenPresent = queenPresent;
            Note = note;
            HiveId = hiveId;
        }

        /// <summary>
        /// Validates the hive inspection data and creates hive inspection
        /// </summary>
        /// <param name="inspectionDate"></param>
        /// <param name="bottomBoardColor"></param>
        /// <param name="honeyFrames"></param>
        /// <param name="honeyAmount"></param>
        /// <param name="broodFrames"></param>
        /// <param name="queenPresent"></param>
        /// <param name="note"></param>
        /// <param name="hiveId"></param>
        /// <returns>Hive inspection if all parameters are valid, error details otherwise</returns>
        public static Result<HiveInspection> Create(
            DateTime inspectionDate, 
            string bottomBoardColor, 
            int honeyFrames, 
            double honeyAmount, 
            int broodFrames, 
            bool queenPresent, 
            string note, 
            EntityId hiveId
        )
        {
            if (string.IsNullOrWhiteSpace(bottomBoardColor))
                return Result<HiveInspection>.Failure("Bottom board color is required");

            if (honeyFrames < 0)
                return Result<HiveInspection>.Failure("Invalid honey frame count");

            if (honeyAmount < 0)
                return Result<HiveInspection>.Failure("Invalid honey amount");

            if (broodFrames < 0)
                return Result<HiveInspection>.Failure("Invalid brood frame count");

            if (hiveId == null || string.IsNullOrWhiteSpace(hiveId.Value))
                return Result<HiveInspection>.Failure("Hive ID is required");

            return Result<HiveInspection>.Success(
                new HiveInspection(
                    EntityId.New(),
                    inspectionDate,
                    bottomBoardColor,
                    honeyFrames,
                    honeyAmount,
                    broodFrames,
                    queenPresent,
                    note,
                    hiveId
                )
            );
        }
    }
}