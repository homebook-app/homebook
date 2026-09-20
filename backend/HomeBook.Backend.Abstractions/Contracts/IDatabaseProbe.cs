namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// defines a probe for testing database connectivity.
/// </summary>
public interface IDatabaseProbe
{
    /// <summary>
    /// the database provider this probe is for.
    /// </summary>
    string ProviderName { get; }

    /// <summary>
    /// checks if a connection to the database can be established with the provided parameters.
    /// </summary>
    /// <param name="host">the database server host</param>
    /// <param name="port">the database server port</param>
    /// <param name="databaseName">the name of the database to connect to</param>
    /// <param name="username">the username for authentication</param>
    /// <param name="password">the password for authentication</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<bool> CanConnectAsync(string host,
        ushort port,
        string databaseName,
        string username,
        string password,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// checks if a connection to the database can be established with the provided file path.
    /// </summary>
    /// <param name="filePath">the path to the database file</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<bool> CanConnectAsync(string filePath,
        CancellationToken cancellationToken = default);
}
