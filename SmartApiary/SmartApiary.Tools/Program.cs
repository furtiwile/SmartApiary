using Azure.Data.Tables;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Queues;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Globalization;

const string defaultStorageConnectionString = "UseDevelopmentStorage=true";
const string defaultSqlConnectionString = "Server=localhost,1433;Database=SmartApiary;User Id=sa;Password=P@ssw0rd!;TrustServerCertificate=True;Encrypt=False;";

var tables = new[]
{
    "Users",
    "Apiaries",
    "Hives",
    "HiveInspections",
    "Parcels",
    "Crops",
    "SmartScales",
    "SprinklingAnnouncements",
    "SprinklingRecords",
    "Telemetries",
    "Devices",
    "DeviceStatuses",
    "Firmwares",
    "ActivationTokens",
    "PasswordResetTokens"
};

var blobContainers = new[] { "firmware-updates" };
var queueNames = new[] { "alert-queue", "device-status-queue", "telemetry-queue" };

Console.WriteLine("--- SmartApiary Tools ---");
Console.WriteLine($"Storage connection: {defaultStorageConnectionString}");
Console.WriteLine($"SQL connection: {GetSqlConnectionString()}");
Console.WriteLine();
Console.WriteLine("1) Clear Azure Tables");
Console.WriteLine("2) Clear Azure Blobs");
Console.WriteLine("3) Clear Azure Queues");
Console.WriteLine("4) Clear SQL Users table");
Console.WriteLine("5) Insert test users into SQL");
Console.WriteLine("6) Initialize SQL Schema for Apiaries/Parcels");
Console.WriteLine("0) Exit");
Console.WriteLine();

while (true)
{
    Console.Write("Select action: ");
    var choice = Console.ReadLine()?.Trim();

    try
    {
        switch (choice)
        {
            case "1":
                await ClearTablesAsync(defaultStorageConnectionString, tables);
                break;
            case "2":
                await ClearBlobsAsync(defaultStorageConnectionString, blobContainers);
                break;
            case "3":
                await ClearQueuesAsync(defaultStorageConnectionString, queueNames);
                break;
            case "4":
                await ClearUsersTableAsync(GetSqlConnectionString());
                break;
            case "5":
                await InsertUsersAsync(GetSqlConnectionString());
                break;
            case "6":
                await EnsureApiarySchemaAsync(GetSqlConnectionString());
                break;
            case "0":
                return;
            default:
                Console.WriteLine("Invalid selection. Choose 0-5.");
                break;
        }
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"[FAILED] {ex.Message}");
        Console.ResetColor();
    }

    Console.WriteLine();
}

string GetSqlConnectionString()
{
    var value = Environment.GetEnvironmentVariable("SMARTAPIARY_SQL_CONNECTION_STRING");
    return string.IsNullOrWhiteSpace(value) ? defaultSqlConnectionString : value;
}

async Task ClearTablesAsync(string connectionString, IReadOnlyCollection<string> tableNames)
{
    var tableServiceClient = new TableServiceClient(connectionString);

    foreach (var tableName in tableNames)
    {
        try
        {
            var tableClient = tableServiceClient.GetTableClient(tableName);
            Console.Write($"Deleting table (if exists): {tableName}...");
            await tableClient.DeleteAsync();
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine(" [DELETED]");
            Console.ResetColor();

            Console.Write($"Creating table: {tableName}...");
            await tableClient.CreateIfNotExistsAsync();
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine(" [OK]");
            Console.ResetColor();
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($" [FAILED] - {ex.Message}");
            Console.ResetColor();
        }
    }
}

async Task ClearBlobsAsync(string connectionString, IReadOnlyCollection<string> containers)
{
    var blobServiceClient = new BlobServiceClient(connectionString);

    foreach (var containerName in containers)
    {
        try
        {
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
            Console.Write($"Deleting blob container (if exists): {containerName}...");
            await containerClient.DeleteIfExistsAsync();
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine(" [DELETED]");
            Console.ResetColor();

            Console.Write($"Creating blob container: {containerName}...");
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine(" [OK]");
            Console.ResetColor();
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($" [FAILED] - {ex.Message}");
            Console.ResetColor();
        }
    }
}

async Task ClearQueuesAsync(string connectionString, IReadOnlyCollection<string> queues)
{
    var queueServiceClient = new QueueServiceClient(connectionString);

    foreach (var queueName in queues)
    {
        try
        {
            var queueClient = queueServiceClient.GetQueueClient(queueName);
            Console.Write($"Deleting queue (if exists): {queueName}...");
            await queueClient.DeleteIfExistsAsync();
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine(" [DELETED]");
            Console.ResetColor();

            Console.Write($"Creating queue: {queueName}...");
            await queueClient.CreateIfNotExistsAsync();
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine(" [OK]");
            Console.ResetColor();
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($" [FAILED] - {ex.Message}");
            Console.ResetColor();
        }
    }
}

async Task ClearUsersTableAsync(string connectionString)
{
    await EnsureDatabaseExistsAsync(connectionString);

    await using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    const string script = "IF OBJECT_ID('[dbo].[Users]', 'U') IS NOT NULL DELETE FROM [dbo].[Users];";
    await using var command = new SqlCommand(script, connection);
    var rows = await command.ExecuteNonQueryAsync();

    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine(rows >= 0 ? "[OK] SQL Users table cleared." : "[OK]");
    Console.ResetColor();
}

async Task InsertUsersAsync(string connectionString)
{
    await EnsureDatabaseExistsAsync(connectionString);

    await EnsureUsersTableAsync(connectionString);
    await EnsureApiarySchemaAsync(connectionString);

    var password = PromptPassword();
    var adminHash = BCrypt.Net.BCrypt.HashPassword(password);
    var beekeeperHash = BCrypt.Net.BCrypt.HashPassword(password);
    var farmerHash = BCrypt.Net.BCrypt.HashPassword(password);

    var users = new[]
    {
        new UserSeed(Guid.NewGuid(), "admin@example.local", "System", "Admin", "+10000000000", adminHash, 1, true),
        new UserSeed(Guid.NewGuid(), "beekeeper@example.local", "John", "Bee", "+10000000001", beekeeperHash, 3, true),
        new UserSeed(Guid.NewGuid(), "farmer@example.local", "Jane", "Farm", "+10000000002", farmerHash, 2, true)
    };

    await using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    foreach (var user in users)
    {
        const string insertSql = @"
INSERT INTO [dbo].[Users]
    (Id, Email, FirstName, LastName, PhoneNumber, PasswordHash, Role, IsActive)
VALUES
    (@Id, @Email, @FirstName, @LastName, @PhoneNumber, @PasswordHash, @Role, @IsActive);";

        await using var command = new SqlCommand(insertSql, connection);
        command.Parameters.Add(new SqlParameter("@Id", SqlDbType.UniqueIdentifier) { Value = user.Id });
        command.Parameters.Add(new SqlParameter("@Email", SqlDbType.NVarChar, 256) { Value = user.Email });
        command.Parameters.Add(new SqlParameter("@FirstName", SqlDbType.NVarChar, 100) { Value = user.FirstName });
        command.Parameters.Add(new SqlParameter("@LastName", SqlDbType.NVarChar, 100) { Value = user.LastName });
        command.Parameters.Add(new SqlParameter("@PhoneNumber", SqlDbType.NVarChar, 50) { Value = user.PhoneNumber });
        command.Parameters.Add(new SqlParameter("@PasswordHash", SqlDbType.NVarChar, 200) { Value = user.PasswordHash });
        command.Parameters.Add(new SqlParameter("@Role", SqlDbType.Int) { Value = user.Role });
        command.Parameters.Add(new SqlParameter("@IsActive", SqlDbType.Bit) { Value = user.IsActive });

        await command.ExecuteNonQueryAsync();
    }

    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine("[OK] Seed users inserted.");
    Console.ResetColor();
}

async Task EnsureUsersTableAsync(string connectionString)
{
    await using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    const string createSql = @"
IF OBJECT_ID('[dbo].[Users]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Users] (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        Email NVARCHAR(256) NOT NULL,
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        PhoneNumber NVARCHAR(50) NOT NULL,
        PasswordHash NVARCHAR(200) NOT NULL,
        Role INT NOT NULL,
        IsActive BIT NOT NULL
    );
END";

    await using var command = new SqlCommand(createSql, connection);
    await command.ExecuteNonQueryAsync();
}

async Task EnsureDatabaseExistsAsync(string connectionString)
{
    var builder = new SqlConnectionStringBuilder(connectionString);
    var databaseName = string.IsNullOrWhiteSpace(builder.InitialCatalog) ? "SmartApiary" : builder.InitialCatalog;

    var masterBuilder = new SqlConnectionStringBuilder(connectionString)
    {
        InitialCatalog = "master"
    };

    await using var connection = new SqlConnection(masterBuilder.ConnectionString);
    await connection.OpenAsync();

    var script = $@"
IF DB_ID(N'{databaseName.Replace("'", "''")}') IS NULL
BEGIN
    CREATE DATABASE [{databaseName.Replace("]", "]]" )}];
END";

    await using var command = new SqlCommand(script, connection);
    await command.ExecuteNonQueryAsync();
}
async Task EnsureApiarySchemaAsync(string connectionString)
{
    await using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    const string schemaSql = @"
IF OBJECT_ID('[dbo].[Apiaries]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Apiaries] (
        [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        [Name] NVARCHAR(256) NOT NULL,
        [Location] GEOGRAPHY NOT NULL,
        [Description] NVARCHAR(1000) NOT NULL,
        [ImageUrl] NVARCHAR(1000) NOT NULL,
        [ThumbnailUrl] NVARCHAR(1000) NOT NULL,
        [BeekeeperId] UNIQUEIDENTIFIER NOT NULL
    );
END

IF OBJECT_ID('[dbo].[Parcels]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Parcels] (
        [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        [Name] NVARCHAR(256) NOT NULL,
        [Location] GEOGRAPHY NOT NULL,
        [FarmerId] UNIQUEIDENTIFIER NOT NULL
    );
END";

    await using var command = new SqlCommand(schemaSql, connection);
    await command.ExecuteNonQueryAsync();
    Console.WriteLine("[OK] SQL Apiaries and Parcels schema verified.");
}
string PromptPassword()
{
    Console.Write("Password for all seed users [Password123!]: ");
    var password = Console.ReadLine();
    return string.IsNullOrWhiteSpace(password) ? "Password123!" : password;
}

internal sealed record UserSeed(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string PasswordHash,
    int Role,
    bool IsActive);
