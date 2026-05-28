namespace SmartApiary.Infrastructure.Common.Options
{
    internal class AzureTableOptions
    {
        public string ConnectionString { get; init; } = string.Empty;
        public string UserTable { get; init; } = string.Empty;
        public string ApiariesTable { get; init; } = string.Empty;
        public string HivesTable { get; init; } = string.Empty;
        public string HiveInspectionsTable { get; init; } = string.Empty;
        public string ParcelsTable { get; init; } = string.Empty;
        public string CropsTable { get; init; } = string.Empty;
        public string SmartScalesTable { get; init; } = string.Empty;
        public string SprinklingAnnouncementsTable { get; init; } = string.Empty;
        public string SprinklingRecordsTable { get; init; } = string.Empty;
        public string TelemetriesTable { get; init; } = string.Empty;
        public string DevicesTable { get; init; } = string.Empty;
        public string DeviceStatusesTable { get; init; } = string.Empty;
        public string FirmwaresTable { get; init; } = string.Empty;
        public string ActivationTokensTable { get; init; } = "ActivationTokens";
        public string PasswordResetTokensTable { get; init; } = "PasswordResetTokens";
    }
}
