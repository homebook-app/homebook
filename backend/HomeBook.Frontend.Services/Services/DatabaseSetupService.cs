using HomeBook.Client;
using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Services.Exceptions;
using HomeBook.Frontend.Services.Mappings;
using Microsoft.Extensions.Logging;
using Microsoft.Kiota.Abstractions;

namespace HomeBook.Frontend.Services.Services;

/// <inheritdoc />
public class DatabaseSetupService(
    ILogger<DatabaseSetupService> logger,
    BackendClient backendClient) : IDatabaseSetupService
{
    /// <inheritdoc />
    public async Task<bool> CheckConnectionAsync(string host,
        ushort port,
        string databaseName,
        string username,
        string password,
        CancellationToken cancellationToken)
    {
        try
        {
            string? databaseType = await backendClient.Setup.Database.Check.PostAsync(
                new CheckDatabaseRequest
                {
                    DatabaseHost = host,
                    DatabasePort = port,
                    DatabaseName = databaseName,
                    DatabaseUserName = username,
                    DatabaseUserPassword = password
                },
                x =>
                {
                },
                cancellationToken);

            return databaseType is not null;
        }
        catch (ApiException err) when (err.ResponseStatusCode == 500)
        {
            logger.LogWarning("Database connection check failed: {Message}", err.Message);

            return false;
        }
        catch (ApiException err) when (err.ResponseStatusCode == 503)
        {
            logger.LogWarning("Database connection check failed: {Message}", err.Message);

            return false;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during database connection check");

            return false;
        }
    }

    /// <inheritdoc />
    public async Task<DatabaseConfiguration?> GetDatabaseConfigurationAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            GetDatabaseCheckResponse? databaseCheckResponse = await backendClient.Setup.Database.Configuration.GetAsync(x =>
            {
            }, cancellationToken);

            if (databaseCheckResponse is null)
            {
                logger.LogWarning("No Database configuration returned");
                return null;
            }

            return databaseCheckResponse.ToDatabaseConfiguration();
        }
        catch (ApiException err) when (err.ResponseStatusCode == 400)
        {
            logger.LogWarning("Validation error, e.g. too short password, etc.");
            throw new InvalidConfigurationException("Database Configuration Validation error, e.g. too short password, etc.", err);
        }
        catch (ApiException err) when (err.ResponseStatusCode == 404)
        {
            logger.LogWarning("No Database configuration found");
            return null;
        }
        catch (ApiException err) when (err.ResponseStatusCode == 500)
        {
            logger.LogWarning("Unknown error while checking Database configuration");
            throw new SetupException("Unknown error while checking Database configuration.", err);
        }
        catch (Exception err)
        {
            logger.LogError(err, "Error while getting database configuration");
            throw new SetupException("Error while getting database configuration", err);
        }
    }
}
