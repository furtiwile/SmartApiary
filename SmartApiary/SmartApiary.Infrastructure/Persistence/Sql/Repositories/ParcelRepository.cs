using Microsoft.Data.SqlClient;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Domain.ValueObjects;

namespace SmartApiary.Infrastructure.Persistence.Sql.Repositories
{
    internal class ParcelRepository : IParcelRepository
    {
        private const string DefaultConnectionString = "Server=localhost,1433;Database=SmartApiary;User Id=sa;Password=P@ssw0rd!;TrustServerCertificate=True;Encrypt=False;";
        private readonly string _connectionString;

        public ParcelRepository()
        {
            _connectionString = Environment.GetEnvironmentVariable("SMARTAPIARY_SQL_CONNECTION_STRING") ?? DefaultConnectionString;
        }

        public async Task<Parcel?> GetByIdAsync(EntityId parcelId, CancellationToken ct = default)
        {
            const string sql = @"
SELECT Id, Name, Location.Lat AS Latitude, Location.Long AS Longitude, FarmerId
FROM dbo.Parcels
WHERE Id = @Id;";

            var parcels = await QueryParcelsAsync(sql, command => {
                command.Parameters.Add(new SqlParameter("@Id", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(parcelId.Value) });
            }, ct);
            return parcels.FirstOrDefault();
        }

        public async Task<Parcel?> GetByIdAsync(EntityId farmerId, EntityId parcelId, CancellationToken ct = default)
        {
            const string sql = @"
SELECT Id, Name, Location.Lat AS Latitude, Location.Long AS Longitude, FarmerId
FROM dbo.Parcels
WHERE Id = @Id AND FarmerId = @FarmerId;";

            var parcels = await QueryParcelsAsync(sql, command => {
                command.Parameters.Add(new SqlParameter("@Id", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(parcelId.Value) });
                command.Parameters.Add(new SqlParameter("@FarmerId", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(farmerId.Value) });
            }, ct);
            return parcels.FirstOrDefault();
        }

        public async Task<IReadOnlyCollection<Parcel>> GetByFarmerIdAsync(EntityId farmerId, CancellationToken ct = default)
        {
            const string sql = @"
SELECT Id, Name, Location.Lat AS Latitude, Location.Long AS Longitude, FarmerId
FROM dbo.Parcels
WHERE FarmerId = @FarmerId;";

            return await QueryParcelsAsync(sql, command => {
                command.Parameters.Add(new SqlParameter("@FarmerId", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(farmerId.Value) });
            }, ct);
        }

        public async Task SaveAsync(Parcel parcel, CancellationToken ct = default)
        {
            const string sql = @"
INSERT INTO dbo.Parcels (Id, Name, Location, FarmerId)
VALUES (@Id, @Name, geography::STGeomFromText(@LocationWkt, 4326), @FarmerId);";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);
            await using var command = new SqlCommand(sql, connection);
            AddParcelParameters(command, parcel);
            await command.ExecuteNonQueryAsync(ct);
        }

        public async Task UpdateAsync(Parcel parcel, CancellationToken ct = default)
        {
            const string sql = @"
UPDATE dbo.Parcels
SET Name = @Name,
    Location = geography::STGeomFromText(@LocationWkt, 4326),
    FarmerId = @FarmerId
WHERE Id = @Id;";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);
            await using var command = new SqlCommand(sql, connection);
            AddParcelParameters(command, parcel);
            await command.ExecuteNonQueryAsync(ct);
        }

        public async Task DeleteAsync(Parcel parcel, CancellationToken ct = default)
        {
            const string sql = @"DELETE FROM dbo.Parcels WHERE Id = @Id;";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.Add(new SqlParameter("@Id", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(parcel.Id.Value) });
            await command.ExecuteNonQueryAsync(ct);
        }

        public async Task<IReadOnlyCollection<Parcel>> GetParcelsWithinRadiusAsync(double latitude, double longitude, double radiusInMeters, CancellationToken ct = default)
        {
            const string sql = @"
DECLARE @targetLocation geography = geography::STGeomFromText(@LocationWkt, 4326);

SELECT Id, Name, Location.Lat AS Latitude, Location.Long AS Longitude, FarmerId
FROM dbo.Parcels
WHERE Location.STDistance(@targetLocation) <= @Radius;";

            return await QueryParcelsAsync(sql, command => {
                string wkt = $"POINT({longitude.ToString(System.Globalization.CultureInfo.InvariantCulture)} {latitude.ToString(System.Globalization.CultureInfo.InvariantCulture)})";
                command.Parameters.Add(new SqlParameter("@LocationWkt", System.Data.SqlDbType.NVarChar, -1) { Value = wkt });
                command.Parameters.Add(new SqlParameter("@Radius", System.Data.SqlDbType.Float) { Value = radiusInMeters });
            }, ct);
        }

        private async Task<IReadOnlyCollection<Parcel>> QueryParcelsAsync(string sql, Action<SqlCommand> configureCommand, CancellationToken ct)
        {
            var parcels = new List<Parcel>();
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);
            await using var command = new SqlCommand(sql, connection);
            configureCommand(command);

            await using var reader = await command.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                var parcel = MapParcel(reader);
                if (parcel != null) parcels.Add(parcel);
            }
            return parcels;
        }

        private static void AddParcelParameters(SqlCommand command, Parcel parcel)
        {
            command.Parameters.Add(new SqlParameter("@Id", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(parcel.Id.Value) });
            command.Parameters.Add(new SqlParameter("@Name", System.Data.SqlDbType.NVarChar, 256) { Value = parcel.Name });

            string wkt = $"POINT({parcel.Longitude.ToString(System.Globalization.CultureInfo.InvariantCulture)} {parcel.Latitude.ToString(System.Globalization.CultureInfo.InvariantCulture)})";
            command.Parameters.Add(new SqlParameter("@LocationWkt", System.Data.SqlDbType.NVarChar, -1) { Value = wkt });

            command.Parameters.Add(new SqlParameter("@FarmerId", System.Data.SqlDbType.UniqueIdentifier) { Value = Guid.Parse(parcel.FarmerId.Value) });
        }

        private static Parcel? MapParcel(SqlDataReader reader)
        {
            var id = reader.GetGuid(reader.GetOrdinal("Id")).ToString();
            var name = reader.GetString(reader.GetOrdinal("Name"));
            var latitude = reader.GetDouble(reader.GetOrdinal("Latitude"));
            var longitude = reader.GetDouble(reader.GetOrdinal("Longitude"));
            var farmerId = reader.GetGuid(reader.GetOrdinal("FarmerId")).ToString();

            var result = Parcel.Load(id, name, latitude, longitude, farmerId);
            return result.IsFailure ? null : result.Value;
        }
    }
}
