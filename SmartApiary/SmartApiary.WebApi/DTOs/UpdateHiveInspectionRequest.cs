using SmartApiary.Application.Features.HiveInspections.Commands;
using System;

namespace SmartApiary.WebApi.DTOs
{
    public class UpdateHiveInspectionRequest
    {
        public string HiveId { get; set; } = string.Empty;
        public DateTime InspectionDate { get; set; }
        public string BottomBoardColor { get; set; } = string.Empty;
        public int HoneyFrames { get; set; }
        public double HoneyAmount { get; set; }
        public int BroodFrames { get; set; }
        public bool QueenPresent { get; set; }
        public string Note { get; set; } = string.Empty;

        public UpdateHiveInspectionCommand ToCommand(string inspectionId)
        {
            return new UpdateHiveInspectionCommand
            {
                HiveId = HiveId,
                InspectionId = inspectionId,
                InspectionDate = InspectionDate,
                BottomBoardColor = BottomBoardColor,
                HoneyFrames = HoneyFrames,
                HoneyAmount = HoneyAmount,
                BroodFrames = BroodFrames,
                QueenPresent = QueenPresent,
                Note = Note
            };
        }
    }
}
