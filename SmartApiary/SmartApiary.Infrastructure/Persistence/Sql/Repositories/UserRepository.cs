using Microsoft.Data.SqlClient;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Infrastructure.Persistence.Sql.Repositories
{
    internal class UserRepository : IUserRepository
    {
        private const string DefaultConnectionString = "Server=localhost,1433;Database=SmartApiary;User Id=sa;Password=P@ssw0rd!;TrustServerCertificate=True;Encrypt=False;";

        private readonly string _connectionString;

        public UserRepository()
        {
            _connectionString = Environment.GetEnvironmentVariable("SMARTAPIARY_SQL_CONNECTION_STRING")
                ?? DefaultConnectionString;
        }

        public async Task<IReadOnlyCollection<User>> GetAllUsersAsync(CancellationToken ct = default)
        {
            const string sql = @"
SELECT Id, Email, FirstName, LastName, PhoneNumber, PasswordHash, [Role], IsActive, WeightDropThreshold
FROM dbo.Users;";

            return await QueryUsersAsync(sql, command => { }, ct);
        }

        public async Task<User?> GetUserByIdAsync(EntityId userId, CancellationToken ct = default)
        {
            const string sql = @"
SELECT Id, Email, FirstName, LastName, PhoneNumber, PasswordHash, [Role], IsActive, WeightDropThreshold
FROM dbo.Users
WHERE Id = @Id;";

            var users = await QueryUsersAsync(sql, command =>
            {
                command.Parameters.Add(new SqlParameter("@Id", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(userId.Value) });
            }, ct);

            return users.FirstOrDefault();
        }

        public async Task<User?> GetUserByIdAndRoleAsync(RoleType role, EntityId userId, CancellationToken ct = default)
        {
            const string sql = @"
SELECT Id, Email, FirstName, LastName, PhoneNumber, PasswordHash, [Role], IsActive, WeightDropThreshold
FROM dbo.Users
WHERE Id = @Id AND [Role] = @Role;";

            var users = await QueryUsersAsync(sql, command =>
            {
                command.Parameters.Add(new SqlParameter("@Id", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(userId.Value) });
                command.Parameters.Add(new SqlParameter("@Role", System.Data.SqlDbType.Int) { Value = (int)role });
            }, ct);

            return users.FirstOrDefault();
        }

        public async Task<User?> GetUserByEmailAsync(string email, CancellationToken ct = default)
        {
            const string sql = @"
SELECT Id, Email, FirstName, LastName, PhoneNumber, PasswordHash, [Role], IsActive, WeightDropThreshold
FROM dbo.Users
WHERE Email = @Email;";

            var users = await QueryUsersAsync(sql, command =>
            {
                command.Parameters.Add(new SqlParameter("@Email", System.Data.SqlDbType.NVarChar, 256) { Value = email });
            }, ct);

            return users.FirstOrDefault();
        }

        public async Task<IReadOnlyCollection<User>> GetAllUsersByRoleAsync(RoleType role, CancellationToken ct = default)
        {
            const string sql = @"
SELECT Id, Email, FirstName, LastName, PhoneNumber, PasswordHash, [Role], IsActive, WeightDropThreshold
FROM dbo.Users
WHERE [Role] = @Role;";

            return await QueryUsersAsync(sql, command =>
            {
                command.Parameters.Add(new SqlParameter("@Role", System.Data.SqlDbType.Int) { Value = (int)role });
            }, ct);
        }

        public async Task SaveUserAsync(User user, CancellationToken ct = default)
        {
            const string sql = @"
INSERT INTO dbo.Users
    (Id, Email, FirstName, LastName, PhoneNumber, PasswordHash, [Role], IsActive, WeightDropThreshold)
VALUES
    (@Id, @Email, @FirstName, @LastName, @PhoneNumber, @PasswordHash, @Role, @IsActive, @WeightDropThreshold);";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);

            await using var command = new SqlCommand(sql, connection);
            AddUserParameters(command, user);

            await command.ExecuteNonQueryAsync(ct);
        }

        public async Task UpdateUserAsync(User user, CancellationToken ct = default)
        {
            const string sql = @"
UPDATE dbo.Users
SET Email = @Email,
    FirstName = @FirstName,
    LastName = @LastName,
    PhoneNumber = @PhoneNumber,
    PasswordHash = @PasswordHash,
    [Role] = @Role,
    IsActive = @IsActive,
    WeightDropThreshold = @WeightDropThreshold
WHERE Id = @Id;";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);

            await using var command = new SqlCommand(sql, connection);
            AddUserParameters(command, user);

            await command.ExecuteNonQueryAsync(ct);
        }

        public async Task DeleteUserAsync(User user, CancellationToken ct = default)
        {
            const string sql = @"
DELETE FROM dbo.Users
WHERE Id = @Id;";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.Add(new SqlParameter("@Id", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(user.Id.Value) });

            await command.ExecuteNonQueryAsync(ct);
        }

        private async Task<IReadOnlyCollection<User>> QueryUsersAsync(string sql, Action<SqlCommand> configureCommand, CancellationToken ct)
        {
            var users = new List<User>();

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);

            await using var command = new SqlCommand(sql, connection);
            configureCommand(command);

            await using var reader = await command.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                var user = MapUser(reader);
                if (user != null)
                {
                    users.Add(user);
                }
            }

            return users;
        }

        private static void AddUserParameters(SqlCommand command, User user)
        {
            command.Parameters.Add(new SqlParameter("@Id", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(user.Id.Value) });
            command.Parameters.Add(new SqlParameter("@Email", System.Data.SqlDbType.NVarChar, 256) { Value = user.Email });
            command.Parameters.Add(new SqlParameter("@FirstName", System.Data.SqlDbType.NVarChar, 100) { Value = user.FirstName });
            command.Parameters.Add(new SqlParameter("@LastName", System.Data.SqlDbType.NVarChar, 100) { Value = user.LastName });
            command.Parameters.Add(new SqlParameter("@PhoneNumber", System.Data.SqlDbType.NVarChar, 50) { Value = user.PhoneNumber });
            command.Parameters.Add(new SqlParameter("@PasswordHash", System.Data.SqlDbType.NVarChar, 200) { Value = user.PasswordHash });
            command.Parameters.Add(new SqlParameter("@Role", System.Data.SqlDbType.Int) { Value = (int)user.Role });
            command.Parameters.Add(new SqlParameter("@IsActive", System.Data.SqlDbType.Bit) { Value = user.IsActive });
            command.Parameters.Add(new SqlParameter("@WeightDropThreshold", System.Data.SqlDbType.Float) { Value = user.WeightDropThreshold });
        }

        private static User? MapUser(SqlDataReader reader)
        {
            var id = reader.GetGuid(reader.GetOrdinal("Id")).ToString();
            var email = reader.GetString(reader.GetOrdinal("Email"));
            var firstName = reader.GetString(reader.GetOrdinal("FirstName"));
            var lastName = reader.GetString(reader.GetOrdinal("LastName"));
            var phoneNumber = reader.GetString(reader.GetOrdinal("PhoneNumber"));
            var passwordHash = reader.GetString(reader.GetOrdinal("PasswordHash"));
            var role = (RoleType)reader.GetInt32(reader.GetOrdinal("Role"));
            var isActive = reader.GetBoolean(reader.GetOrdinal("IsActive"));
            var weightDropThreshold = reader.GetDouble(reader.GetOrdinal("WeightDropThreshold"));

            var result = User.Load(id, email, firstName, lastName, phoneNumber, passwordHash, role, isActive, weightDropThreshold);
            return result.IsFailure ? null : result.Value;
        }
    }
}