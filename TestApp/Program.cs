using Azure.Data.Tables;
var client = new TableClient("UseDevelopmentStorage=true", "SmartScales");
Console.WriteLine("Listing scales:");
await foreach(var entity in client.QueryAsync<TableEntity>()) { 
    Console.WriteLine($"PK: {entity.PartitionKey}, RK: {entity.RowKey}, Status: {entity.GetString("Status")}, Serial: {entity.GetString("SerialNumber")}"); 
}
