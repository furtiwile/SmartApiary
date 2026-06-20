using Azure.Data.Tables;
using Azure.Storage.Blobs;
using Azure.Storage.Queues;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace SmartApiary.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DebugController(
        TableServiceClient tableServiceClient,
        BlobServiceClient blobServiceClient,
        QueueServiceClient queueServiceClient
    ) : ControllerBase
    {
        private const string SqlConnectionString = "Server=localhost,1433;Database=SmartApiary;User Id=sa;Password=P@ssw0rd!;TrustServerCertificate=True;Encrypt=False;";

        private static readonly string[] AzureTables =
        [
            "Hives",
            "HiveInspections",
            "Crops",
            "SmartScales",
            "SprinklingAnnouncements",
            "SprinklingRecords",
            "Telemetries",
            "ActivationTokens",
            "PasswordResetTokens"
        ];

        private static readonly string[] SqlTables =
        [
            "Users",
            "Apiaries",
            "Parcels"
        ];

        [HttpGet("tables")]
        public async Task<IActionResult> ListTables()
        {
            var result = new Dictionary<string, object>();

            // 1. Get Azure Storage Tables counts
            var azureCounts = new Dictionary<string, int>();
            foreach (var tableName in AzureTables)
            {
                try
                {
                    var tableClient = tableServiceClient.GetTableClient(tableName);
                    int count = 0;
                    await foreach (var entity in tableClient.QueryAsync<TableEntity>())
                    {
                        count++;
                    }
                    azureCounts[tableName] = count;
                }
                catch (Exception)
                {
                    azureCounts[tableName] = -1; // Indicates error / table not ready
                }
            }
            result["azureTables"] = azureCounts;

            // 2. Get SQL Server counts
            var sqlCounts = new Dictionary<string, int>();
            foreach (var tableName in SqlTables)
            {
                try
                {
                    var connStr = Environment.GetEnvironmentVariable("SMARTAPIARY_SQL_CONNECTION_STRING") ?? SqlConnectionString;
                    await using var conn = new SqlConnection(connStr);
                    await conn.OpenAsync();
                    
                    var query = $"SELECT COUNT(*) FROM dbo.{tableName};";
                    await using var cmd = new SqlCommand(query, conn);
                    var scalarVal = await cmd.ExecuteScalarAsync();
                    var count = scalarVal == DBNull.Value || scalarVal == null ? 0 : Convert.ToInt32(scalarVal);
                    sqlCounts[tableName] = count;
                }
                catch (Exception)
                {
                    sqlCounts[tableName] = -1;
                }
            }
            result["sqlTables"] = sqlCounts;

            return Ok(result);
        }

        [HttpGet("tables/{tableName}")]
        public async Task<IActionResult> GetTableContent(string tableName)
        {
            if (AzureTables.Contains(tableName, StringComparer.OrdinalIgnoreCase))
            {
                try
                {
                    var tableClient = tableServiceClient.GetTableClient(tableName);
                    var list = new List<IDictionary<string, object>>();
                    await foreach (var entity in tableClient.QueryAsync<TableEntity>())
                    {
                        var dict = new Dictionary<string, object>();
                        foreach (var key in entity.Keys)
                        {
                            dict[key] = entity[key];
                        }
                        dict["PartitionKey"] = entity.PartitionKey;
                        dict["RowKey"] = entity.RowKey;
                        if (entity.Timestamp.HasValue)
                        {
                            dict["Timestamp"] = entity.Timestamp.Value;
                        }
                        list.Add(dict);
                    }
                    return Ok(list);
                }
                catch (Exception ex)
                {
                    return BadRequest(new { error = ex.Message });
                }
            }

            if (SqlTables.Contains(tableName, StringComparer.OrdinalIgnoreCase))
            {
                try
                {
                    var connStr = Environment.GetEnvironmentVariable("SMARTAPIARY_SQL_CONNECTION_STRING") ?? SqlConnectionString;
                    await using var conn = new SqlConnection(connStr);
                    await conn.OpenAsync();

                    var query = $"SELECT * FROM dbo.{tableName};";
                    await using var cmd = new SqlCommand(query, conn);
                    await using var reader = await cmd.ExecuteReaderAsync();
                    
                    var list = new List<Dictionary<string, object>>();

                    while (await reader.ReadAsync())
                    {
                        var row = new Dictionary<string, object>();
                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            var name = reader.GetName(i);
                            var val = reader.GetValue(i);
                            
                            if (val != null && (val.GetType().Name == "SqlGeography" || (val.GetType().FullName?.Contains("Spatial") == true) || val.GetType().Name.Contains("Geography")))
                            {
                                row[name] = val.ToString() ?? string.Empty;
                            }
                            else
                            {
                                row[name] = val == DBNull.Value ? null : val;
                            }
                        }
                        list.Add(row);
                    }
                    return Ok(list);
                }
                catch (Exception ex)
                {
                    return BadRequest(new { error = ex.Message });
                }
            }

            return NotFound(new { error = $"Table {tableName} not found in monitored tables." });
        }

        [HttpGet("blobs")]
        public async Task<IActionResult> ListBlobs()
        {
            var result = new List<object>();
            try
            {
                var containers = blobServiceClient.GetBlobContainersAsync();
                await foreach (var container in containers)
                {
                    var containerClient = blobServiceClient.GetBlobContainerClient(container.Name);
                    var blobsList = new List<object>();
                    var blobs = containerClient.GetBlobsAsync();
                    await foreach (var blob in blobs)
                    {
                        blobsList.Add(new
                        {
                            name = blob.Name,
                            size = blob.Properties?.ContentLength ?? 0,
                            contentType = blob.Properties?.ContentType ?? "application/octet-stream"
                        });
                    }
                    result.Add(new
                    {
                        containerName = container.Name,
                        blobs = blobsList
                    });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("queues")]
        public async Task<IActionResult> ListQueues()
        {
            var result = new List<object>();
            try
            {
                var queues = queueServiceClient.GetQueuesAsync();
                await foreach (var queue in queues)
                {
                    var queueClient = queueServiceClient.GetQueueClient(queue.Name);
                    var props = await queueClient.GetPropertiesAsync();
                    
                    result.Add(new
                    {
                        queueName = queue.Name,
                        approximateMessagesCount = props.Value.ApproximateMessagesCount
                    });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
