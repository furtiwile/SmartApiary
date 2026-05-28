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
            var activationTable = options.Value.ActivationTokensTable;
            var resetTable = options.Value.PasswordResetTokensTable;

            await EnsureTableExistsAsync(activationTable, cancellationToken);
            await EnsureTableExistsAsync(resetTable, cancellationToken);
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
