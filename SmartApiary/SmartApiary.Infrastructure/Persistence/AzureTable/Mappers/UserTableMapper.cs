using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence.AzureTable.Common;
using SmartApiary.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class UserTableMapper : ITableMapper<User, UserEntity>
    {
        public UserEntity ToEntity(User domain)
        {
            return new UserEntity
            {
                Email = domain.Email,
                FirstName = domain.FirstName,
                LastName = domain.LastName,
                PhoneNumber = domain.PhoneNumber,
                PasswordHash = domain.PasswordHash,
                Role = domain.Role.ToString(),
                IsActive = domain.IsActive
            };
        }

        public User? ToDomain(UserEntity entity)
        {
            var type = Enum.TryParse<RoleType>(entity.PartitionKey, out var parsedType)
                ? parsedType
                : RoleType.Unknown;

            var userResult = User.Load(
                entity.RowKey,
                entity.Email,
                entity.FirstName,
                entity.LastName,
                entity.PhoneNumber,
                entity.PasswordHash,
                type,
                entity.IsActive
            );

            if (userResult.IsFailure)
                return null;

            return userResult.Value;
        }
    }
}
