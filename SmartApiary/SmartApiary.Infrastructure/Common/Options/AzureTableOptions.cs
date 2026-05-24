namespace SmartApiary.Infrastructure.Common.Options
{
    internal class AzureTableOptions
    {
        public string ConnectionString { get; init; } = string.Empty;
        public string UserTable { get; init; } = string.Empty;
        public string TelemetriesTable { get; init; } = string.Empty;
        public string DevicesTable { get; init; } = string.Empty;
        public string DeviceStatusesTable { get; init; } = string.Empty;
        public string FirmwaresTable { get; init; } = string.Empty;
    }
}
