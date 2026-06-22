using Microsoft.AspNetCore.SignalR;

namespace SmartApiary.WebApi.Hubs
{
    public class DeviceHub : Hub
    {
        public Task JoinApiaryGroup(string apiaryId)
        {
            if (string.IsNullOrWhiteSpace(apiaryId)) return Task.CompletedTask;
            return Groups.AddToGroupAsync(Context.ConnectionId, $"apiary:{apiaryId}");
        }

        public Task LeaveApiaryGroup(string apiaryId)
        {
            if (string.IsNullOrWhiteSpace(apiaryId)) return Task.CompletedTask;
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, $"apiary:{apiaryId}");
        }

        public Task JoinHiveGroup(string hiveId)
        {
            if (string.IsNullOrWhiteSpace(hiveId)) return Task.CompletedTask;
            return Groups.AddToGroupAsync(Context.ConnectionId, $"hive:{hiveId}");
        }

        public Task LeaveHiveGroup(string hiveId)
        {
            if (string.IsNullOrWhiteSpace(hiveId)) return Task.CompletedTask;
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, $"hive:{hiveId}");
        }

        public Task JoinBeekeeperGroup(string beekeeperId)
        {
            if (string.IsNullOrWhiteSpace(beekeeperId)) return Task.CompletedTask;
            return Groups.AddToGroupAsync(Context.ConnectionId, $"beekeeper:{beekeeperId}");
        }

        public Task LeaveBeekeeperGroup(string beekeeperId)
        {
            if (string.IsNullOrWhiteSpace(beekeeperId)) return Task.CompletedTask;
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, $"beekeeper:{beekeeperId}");
        }

        public Task JoinPrivateChannel(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) return Task.CompletedTask;
            return Groups.AddToGroupAsync(Context.ConnectionId, $"private:{userId}");
        }

        public Task LeavePrivateChannel(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) return Task.CompletedTask;
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, $"private:{userId}");
        }
    }
}
