namespace SmartApiary.Infrastructure.Persistence.AzureTable.Entities
{
    internal class HiveEntity : BaseTableEntity
    {
        public string Designation { get; set; } = default!;
        public string Type { get; set; } = default!;
        public string SuperColor { get; set; } = default!;
        public int QueenAge { get; set; } = default;
        public string Note { get; set; } = default!;
        public string ApiaryId { get; set; } = default!;
        public string SmartScaleId { get; set; } = default!;
    }
}
