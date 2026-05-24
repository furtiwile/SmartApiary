using SmartApiary.Domain.Common;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartApiary.Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<IReadOnlyCollection<User>> GetAllUsersAsync(CancellationToken ct = default);
        Task<User?> GetUserByIdAsync(EntityId userId, CancellationToken ct = default);
        Task<User?> GetUserByIdAndRoleAsync(RoleType role, EntityId userId, CancellationToken ct = default);
        Task<User?> GetUserByEmailAsync(string email, CancellationToken ct = default);
        Task<IReadOnlyCollection<User>> GetAllUsersByRoleAsync(RoleType role, CancellationToken ct = default);
        Task SaveUserAsync(User user, CancellationToken ct = default);
        Task UpadateUserAsync(User user, CancellationToken ct = default);
        Task DeleteUserAsync(User user, CancellationToken ct = default);
    }
}
