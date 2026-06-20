# Cloud application development in smart grid systems 

## Local setup (Auth + Tokens)

1. Start infrastructure containers (MSSQL + Azurite):
	- From `Docker` folder run: `docker compose up -d`
2. Initialize or clean storage and seed users:
	- Run `dotnet run --project SmartApiary.Tools` and choose the menu action you need.
	- Option 1 clears and recreates Azure Tables.
	- Option 2 clears Azure Blob containers.
	- Option 3 clears Azure Queues.
	- Option 4 clears the SQL `[dbo].[Users]` table.
	- Option 5 inserts test users into SQL and hashes their passwords with BCrypt inside the tool.
3. Seed MSSQL with test users (optional):
	- Use option 5 in `SmartApiary.Tools` instead of a separate SQL script.
4. Configure SendGrid API key (optional for sending emails):
	- Set `EmailOptions:SendGridApiKey` in `SmartApiary.WebApi/appsettings.Development.json` or environment variables. For local development, you can leave it empty and enable `EmailOptions:ReturnLinkInResponse` to receive activation/reset links in API responses.
	- `FromEmail` and `FromName` can be set in the same config section.
5. Start backend services:
	- Run `SmartApiary.WebApi` and `SmartApiary.Functions` (multiple startup projects). Ensure `AzureTableOptions:ConnectionString` is `UseDevelopmentStorage=true` when using Azurite.

Notes:
- Activation and password reset tokens are stored in Azure Table Storage (ActivationTokens, PasswordResetTokens).
- Admin creates users via `/api/auth/admin-create` (requires an Admin JWT). In local dev with `ReturnLinkInResponse=true`, the activation link is returned in the API response.
- If you want a non-default SQL connection string for the tool, set `SMARTAPIARY_SQL_CONNECTION_STRING` before running it.

---

## Configuration & Environment Reference

To run the backend projects locally without configuration errors (such as `AzureTableOptions:ConnectionString is not configured`), ensure the following files exist and are populated with local storage connections:

### 1. `SmartApiary.WebApi` Configuration
*   **File Location**: `SmartApiary/SmartApiary.WebApi/appsettings.json` (or `appsettings.Development.json`)
*   **Main Configuration Elements**:
    ```json
    {
      "AzureTableOptions": {
        "ConnectionString": "UseDevelopmentStorage=true",
        "UserTable": "Users",
        "HivesTable": "Hives",
        "SmartScalesTable": "SmartScales",
        "TelemetriesTable": "Telemetries"
      },
      "AzureQueueOptions": {
        "ConnectionString": "UseDevelopmentStorage=true",
        "AlertQueue": "alert-queue",
        "TelemetryQueue": "telemetry-queue",
        "AnnouncementQueue": "announcement-queue"
      },
      "AzureBlobOptions": {
        "ConnectionString": "UseDevelopmentStorage=true",
        "FirmwareBlob": "firmware-updates",
        "ApiaryImagesBlob": "apiary-images"
      },
      "JwtOptions": {
        "Secret": "SmartApiary_Dev_Jwt_Key_AtLeast_32_Chars_2026",
        "Issuer": "SmartApiary",
        "Audience": "SmartApiary"
      }
    }
    ```

### 2. `SmartApiary.Functions` Configuration
*   **File Location**: `SmartApiary/SmartApiary.Functions/appsettings.json` (and `local.settings.json` for environment keys)
*   **Values to populate**:
    - The `appsettings.json` file in `SmartApiary.Functions` must mirror the root-level configuration sections (`AzureTableOptions`, `AzureQueueOptions`, `AzureBlobOptions`) from the WebApi project.
    - The `local.settings.json` file contains values used by the Azure Function Host:
      ```json
      {
        "IsEncrypted": false,
        "Values": {
          "AzureWebJobsStorage": "UseDevelopmentStorage=true",
          "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
          "SMARTAPIARY_SQL_CONNECTION_STRING": "Server=localhost,1433;Database=SmartApiary;User Id=sa;Password=P@ssw0rd!;TrustServerCertificate=True;Encrypt=False;"
        }
      }
      ```

### 3. Docker Infrastructure Connection
*   **File Location**: `Docker/.env`
*   **Purpose**: Populates the default passwords for the Microsoft SQL container:
    ```env
    DATABASE_PASSWORD=P@ssw0rd!
    DATABASE_PID=Developer
    ```

