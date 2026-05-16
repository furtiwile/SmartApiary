using SmartGrid.Domain.Enums;

namespace SmartGrid.Domain.Models
{
    public class Hive
    {
        public Guid Id { get; set; }
        public string Designation { get; set; } = string.Empty;
        public HiveType Type { get; set; }
        public string SuperColor { get; set; } = string.Empty;
        public int QueenAge { get; set; }
        public string Note { get; set; } = string.Empty;

        public Guid ApiaryId { get; set; }
        public Apiary Apiary { get; set; }

        public SmartScale Device { get; set; }
        public ICollection<HiveInspection> Inspections { get; set; } = new List<HiveInspection>();
    }
}