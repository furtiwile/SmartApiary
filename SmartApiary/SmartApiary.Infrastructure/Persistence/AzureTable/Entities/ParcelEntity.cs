namespace SmartApiary.Infrastructure.Persistence.AzureTable.Entities
{
    internal class ParcelEntity : BaseTableEntity
    {
        public string Name { get; set; } = default!;
        public double Latitude { get; set; } = default;
        public double Longitude { get; set; } = default;
        public string FarmerId { get; set; } = default!;
    }
}
