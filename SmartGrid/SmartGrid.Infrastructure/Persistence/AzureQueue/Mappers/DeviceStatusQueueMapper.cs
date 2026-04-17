using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureQueue.Messages;

namespace SmartGrid.Infrastructure.Persistence.AzureQueue.Mappers
{
    public static class DeviceStatusQueueMapper
    {
        public static DeviceStatusMessage? ToQueueMessage(this DeviceStatus model)
        {
            if (model == null) return null;

            return new DeviceStatusMessage
            {
                // TODO
            };
        }

        public static DeviceStatus? ToDomainModel(this DeviceStatusMessage message)
        {
            // TODO
            throw new NotImplementedException();
        }
    }
}
