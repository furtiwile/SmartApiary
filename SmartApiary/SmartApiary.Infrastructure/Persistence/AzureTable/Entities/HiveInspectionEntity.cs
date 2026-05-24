namespace SmartApiary.Infrastructure.Persistence.AzureTable.Entities
{
    internal class HiveInspectionEntity : BaseTableEntity
    {
        public DateTime InspectionDate { get; set; }
        public string BottomBoardColor { get; set; } = default!;
        public int HoneyFrames { get; set; } = default;
        public double HoneyAmount { get; set; } = default;
        public int BroodFrames { get; set; } = default;
        public bool QueenPresent { get; set; } = default;
        public string Note { get; set; } = default!;
        public string HiveId { get; set; } = default!;
    }
}
