namespace SmartApiary.Infrastructure.Persistence.AzureTable.Entities
{
    internal class CropEntity : BaseTableEntity
    {
        public string Type { get; set; } = default!;
        public DateTime ExpectedFloweringTime { get; set; }
        public string Note { get; set; } = default!;
        public string ParcelId { get; set; } = default!;
    }
}
