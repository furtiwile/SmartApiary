using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class TelemetryTableKeyProvider : ITableKeyProvider<Telemetry>
    {
        public string GetPartitionKey(Telemetry model)
        {
            return model.SmartScaleId.Value;
        }

        public string GetRowKey(Telemetry model)
        {
            return string.Format("{0:D19}", DateTime.MaxValue.Ticks - model.Timestamp.Ticks);
        }
    }
}
