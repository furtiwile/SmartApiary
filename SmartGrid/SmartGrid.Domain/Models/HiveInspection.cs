namespace SmartGrid.Domain.Models
{
    public class HiveInspection
    {
        public Guid Id { get; set; }
        public DateTime InspectionDate { get; set; }
        public Guid HiveId { get; set; }
        public string BottomBoardColor { get; set; } = string.Empty;
        public int HoneyFrames { get; set; }
        public double HoneyAmount { get; set; }
        public int BroodFrames { get; set; }
        public bool QueenPresent { get; set; }
        public string Note { get; set; } = string.Empty;

        public Hive Hive { get; set; }
    }
}