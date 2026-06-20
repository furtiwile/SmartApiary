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
- If you have problems with running MSSQL server in Docker (constant restarts), inside `compose.yml`, replace `MSSQL_SA_PASSWORD` value with `"P@ssw0rd!"` (from `"DATABASE_PASSWORD:-P@ssw0rd!"`, line 8) and `MSSQL_PID` value with `Developer` (from `"DATABASE_PID:-Developer"`, line 9)
