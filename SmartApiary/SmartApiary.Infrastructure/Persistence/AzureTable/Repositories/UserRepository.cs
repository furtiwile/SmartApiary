using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using SmartApiary.Infrastructure.Common.Options;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Repositories
{
    internal class UserRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<User> userKeyProvider,
        ITableMapper<User, UserEntity> userMapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<User, UserEntity>(
            tableServiceClient.GetTableClient(options.Value.UserTable),
            userKeyProvider,
            userMapper
        ), IUserRepository
    {
        public async Task<IReadOnlyCollection<User>> GetAllUsersAsync(CancellationToken ct = default)
        {
            return await base.QueryAsync(string.Empty, ct);
        }

        public async Task<User?> GetUserByIdAsync(EntityId userId, CancellationToken ct = default)
        {
            return (await base.QueryAsync(string.Empty, ct)).FirstOrDefault(u => u.Id == userId);
        }

        public async Task<User?> GetUserByIdAndRoleAsync(RoleType role, EntityId userId, CancellationToken ct = default)
        {
            return await base.GetByIdAsync(role.ToString(), userId, ct);
        }

        public async Task<User?> GetUserByEmailAsync(string email, CancellationToken ct = default)
        {
            return (await base.QueryAsync($"Email eq '{email}'", ct)).FirstOrDefault();
        }

        public async Task<IReadOnlyCollection<User>> GetAllUsersByRoleAsync(RoleType role, CancellationToken ct = default)
        {
            return await base.QueryByPartitionKeyAsync(role.ToString(), ct);
        }

        public async Task SaveUserAsync(User user, CancellationToken ct = default)
        {
            await base.AddAsync(user, ct);
        }

        public async Task UpadateUserAsync(User user, CancellationToken ct = default)
        {
            await base.UpdateAsync(user, ct);
        }

        public async Task DeleteUserAsync(User user, CancellationToken ct = default)
        {
            await base.DeleteAsync(user, ct);
        }

    }
}
