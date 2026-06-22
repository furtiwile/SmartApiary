using Azure.Data.Tables;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartApiary.Infrastructure.Common.Options;

namespace SmartApiary.Infrastructure.Services
{
    internal sealed class TokenTablesInitializerHostedService(
        TableServiceClient tableServiceClient,
        IOptions<AzureTableOptions> options,
        ILogger<TokenTablesInitializerHostedService> logger
    ) : IHostedService
    {
        public async Task StartAsync(CancellationToken cancellationToken)
        {
            try
            {
                var tableNames = new[]
                {
                    options.Value.UserTable,
                    options.Value.ApiariesTable,
                    options.Value.HivesTable,
                    options.Value.HiveInspectionsTable,
                    options.Value.ParcelsTable,
                    options.Value.CropsTable,
                    options.Value.SmartScalesTable,
                    options.Value.SprinklingAnnouncementsTable,
                    options.Value.SprinklingRecordsTable,
                    options.Value.TelemetriesTable,

                    options.Value.ActivationTokensTable,
                    options.Value.PasswordResetTokensTable,
                    options.Value.NotificationsTable
                };

                foreach (var tableName in tableNames)
                {
                    await EnsureTableExistsAsync(tableName, cancellationToken);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to initialize Azure Tables during application startup.");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

        private async Task EnsureTableExistsAsync(string tableName, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(tableName))
            {
                logger.LogWarning("Skipping token table initialization because table name is empty.");
                return;
            }

            await tableServiceClient.CreateTableIfNotExistsAsync(tableName, cancellationToken);
            logger.LogInformation("Ensured Azure Table exists: {TableName}", tableName);
        }
    }
}
