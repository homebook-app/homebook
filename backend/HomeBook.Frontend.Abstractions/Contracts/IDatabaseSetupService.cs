using HomeBook.Frontend.Abstractions.Models;

namespace HomeBook.Frontend.Abstractions.Contracts;

/// <summary>
///
/// </summary>
public interface IDatabaseSetupService
{
    /// <summary>
    /// checks the connection to the database with the provided parameters.
    /// returns true if the connection is successful, otherwise false.
    /// </summary>
    /// <param name="host"></param>
    /// <param name="port"></param>
    /// <param name="databaseName"></param>
    /// <param name="username"></param>
    /// <param name="password"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<bool> CheckConnectionAsync(string host,
        ushort port,
        string databaseName,
        string username,
        string password,
        CancellationToken cancellationToken);

    /// <summary>
    /// returns the stored database configuration.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<DatabaseConfiguration?> GetDatabaseConfigurationAsync(CancellationToken cancellationToken = default);
}
