using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
/* TODO: DELETE
    internal class TelemetryTableKeyProvider : ITableKeyProvider<Telemetry>
    {
        public string GetPartitionKey(Telemetry model)
        {
            return model.DeviceId.Value;
        }

        public string GetRowKey(Telemetry model)
        {
            string invertedTicks = (DateTime.MaxValue.Ticks - model.Timestamp.Ticks).ToString("d19");

            return $"{invertedTicks}_{model.Id.Value}";
        }
    }
*/
}
