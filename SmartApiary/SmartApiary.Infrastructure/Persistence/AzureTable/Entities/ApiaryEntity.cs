namespace SmartApiary.Infrastructure.Persistence.AzureTable.Entities
{
    internal class ApiaryEntity : BaseTableEntity
    {
        public string Name { get; set; } = default!;
        public double Latitude { get; set; } = default;
        public double Longitude { get; set; } = default;
        public string Description { get; set; } = default!;
        public string ImageUrl { get; set; } = default!;
        public string ThumbnailUrl { get; set; } = default!;
        public string BeekeeperId { get; set; } = default!;
    }
}
