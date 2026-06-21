using Microsoft.Data.SqlClient;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Infrastructure.Persistence.Sql.Repositories
{
    internal class ApiaryRepository : IApiaryRepository
    {
        private const string DefaultConnectionString = "Server=localhost,1433;Database=SmartApiary;User Id=sa;Password=P@ssw0rd!;TrustServerCertificate=True;Encrypt=False;";
        private readonly string _connectionString;

        public ApiaryRepository()
        {
            _connectionString = Environment.GetEnvironmentVariable("SMARTAPIARY_SQL_CONNECTION_STRING") ?? DefaultConnectionString;
        }

        public async Task<IReadOnlyCollection<Apiary>> GetAllAsync(CancellationToken ct = default)
        {
            const string sql = @"
SELECT Id, Name, Location.Lat AS Latitude, Location.Long AS Longitude, Description, ImageUrl, ThumbnailUrl, BeekeeperId
FROM dbo.Apiaries;";
            return await QueryApiariesAsync(sql, command => { }, ct);
        }

        public async Task<Apiary?> GetByIdAsync(EntityId beekeeperId, EntityId apiaryId, CancellationToken ct = default)
        {
            const string sql = @"
SELECT Id, Name, Location.Lat AS Latitude, Location.Long AS Longitude, Description, ImageUrl, ThumbnailUrl, BeekeeperId
FROM dbo.Apiaries
WHERE Id = @Id AND BeekeeperId = @BeekeeperId;";

            var list = await QueryApiariesAsync(sql, command =>
            {
                command.Parameters.Add(new SqlParameter("@Id", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(apiaryId.Value) });
                command.Parameters.Add(new SqlParameter("@BeekeeperId", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(beekeeperId.Value) });
            }, ct);
            return list.FirstOrDefault();
        }

        public async Task<IReadOnlyCollection<Apiary>> GetByBeekeeperIdAsync(EntityId beekeeperId, CancellationToken ct = default)
        {
            const string sql = @"
SELECT Id, Name, Location.Lat AS Latitude, Location.Long AS Longitude, Description, ImageUrl, ThumbnailUrl, BeekeeperId
FROM dbo.Apiaries
WHERE BeekeeperId = @BeekeeperId;";

            return await QueryApiariesAsync(sql, command =>
            {
                command.Parameters.Add(new SqlParameter("@BeekeeperId", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(beekeeperId.Value) });
            }, ct);
        }

        public async Task SaveAsync(Apiary apiary, CancellationToken ct = default)
        {
            const string sql = @"
INSERT INTO dbo.Apiaries (Id, Name, Location, Description, ImageUrl, ThumbnailUrl, BeekeeperId)
VALUES (@Id, @Name, geography::STGeomFromText(@LocationWkt, 4326), @Description, @ImageUrl, @ThumbnailUrl, @BeekeeperId);";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);
            await using var command = new SqlCommand(sql, connection);
            AddApiaryParameters(command, apiary);
            await command.ExecuteNonQueryAsync(ct);
        }

        public async Task UpdateAsync(Apiary apiary, CancellationToken ct = default)
        {
            const string sql = @"
UPDATE dbo.Apiaries
SET Name = @Name,
    Location = geography::STGeomFromText(@LocationWkt, 4326),
    Description = @Description,
    ImageUrl = @ImageUrl,
    ThumbnailUrl = @ThumbnailUrl,
    BeekeeperId = @BeekeeperId
WHERE Id = @Id;";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);
            await using var command = new SqlCommand(sql, connection);
            AddApiaryParameters(command, apiary);
            await command.ExecuteNonQueryAsync(ct);
        }

        public async Task DeleteAsync(Apiary apiary, CancellationToken ct = default)
        {
            const string sql = @"DELETE FROM dbo.Apiaries WHERE Id = @Id;";
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.Add(new SqlParameter("@Id", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(apiary.Id.Value) });
            await command.ExecuteNonQueryAsync(ct);
        }
        public async Task<IReadOnlyCollection<Apiary>> GetApiariesWithinRadiusAsync(double latitude, double longitude, double radiusInMeters, CancellationToken ct = default)
        {
            const string sql = @"
DECLARE @targetLocation geography = geography::STGeomFromText(@LocationWkt, 4326);

SELECT Id, Name, Location.Lat AS Latitude, Location.Long AS Longitude, Description, ImageUrl, ThumbnailUrl, BeekeeperId
FROM dbo.Apiaries
WHERE Location.STDistance(@targetLocation) <= @Radius;";

            return await QueryApiariesAsync(sql, command =>
            {
                string wkt = $"POINT({longitude.ToString(System.Globalization.CultureInfo.InvariantCulture)} {latitude.ToString(System.Globalization.CultureInfo.InvariantCulture)})";
                command.Parameters.Add(new SqlParameter("@LocationWkt", System.Data.SqlDbType.NVarChar, -1) { Value = wkt });
                command.Parameters.Add(new SqlParameter("@Radius", System.Data.SqlDbType.Float) { Value = radiusInMeters });
            }, ct);
        }
        public async Task<Apiary?> GetByIdAsync(EntityId apiaryId, CancellationToken ct = default)
        {
            const string sql = @"
SELECT Id, Name, Location.Lat AS Latitude, Location.Long AS Longitude, Description, ImageUrl, ThumbnailUrl, BeekeeperId
FROM dbo.Apiaries
WHERE Id = @Id;";

            var list = await QueryApiariesAsync(sql, command =>
            {
                command.Parameters.Add(new SqlParameter("@Id", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(apiaryId.Value) });
            }, ct);
            return list.FirstOrDefault();
        }
        private async Task<IReadOnlyCollection<Apiary>> QueryApiariesAsync(string sql, Action<SqlCommand> configureCommand, CancellationToken ct)
        {
            var apiaries = new List<Apiary>();
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);
            await using var command = new SqlCommand(sql, connection);
            configureCommand(command);

            await using var reader = await command.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                var apiary = MapApiary(reader);
                if (apiary != null) apiaries.Add(apiary);
            }
            return apiaries;
        }

        private static void AddApiaryParameters(SqlCommand command, Apiary apiary)
        {
            command.Parameters.Add(new SqlParameter("@Id", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(apiary.Id.Value) });
            command.Parameters.Add(new SqlParameter("@Name", System.Data.SqlDbType.NVarChar, 256) { Value = apiary.Name });

            string wkt = $"POINT({apiary.Longitude.ToString(System.Globalization.CultureInfo.InvariantCulture)} {apiary.Latitude.ToString(System.Globalization.CultureInfo.InvariantCulture)})";
            command.Parameters.Add(new SqlParameter("@LocationWkt", System.Data.SqlDbType.NVarChar, -1) { Value = wkt });

            command.Parameters.Add(new SqlParameter("@Description", System.Data.SqlDbType.NVarChar, 1000) { Value = apiary.Description });
            command.Parameters.Add(new SqlParameter("@ImageUrl", System.Data.SqlDbType.NVarChar, 1000) { Value = apiary.ImageUrl });
            command.Parameters.Add(new SqlParameter("@ThumbnailUrl", System.Data.SqlDbType.NVarChar, 1000) { Value = apiary.ThumbnailUrl });
            command.Parameters.Add(new SqlParameter("@BeekeeperId", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(apiary.BeekeeperId.Value) });
        }

        private static Apiary? MapApiary(SqlDataReader reader)
        {
            var id = reader.GetGuid(reader.GetOrdinal("Id")).ToString();
            var name = reader.GetString(reader.GetOrdinal("Name"));
            var latitude = reader.GetDouble(reader.GetOrdinal("Latitude"));
            var longitude = reader.GetDouble(reader.GetOrdinal("Longitude"));
            var description = reader.GetString(reader.GetOrdinal("Description"));
            var imageUrl = reader.GetString(reader.GetOrdinal("ImageUrl"));
            var thumbnailUrl = reader.GetString(reader.GetOrdinal("ThumbnailUrl"));
            var beekeeperId = reader.GetGuid(reader.GetOrdinal("BeekeeperId")).ToString();

            var result = Apiary.Load(id, name, latitude, longitude, description, imageUrl, thumbnailUrl, beekeeperId);
            return result.IsFailure ? null : result.Value;
        }
    }
}