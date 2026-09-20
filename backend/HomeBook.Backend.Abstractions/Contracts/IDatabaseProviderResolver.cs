using HomeBook.Backend.Abstractions.Setup;

namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// defines a service to resolve the database provider based on connection parameters.
/// </summary>
public interface IDatabaseProviderResolver
{
    /// <summary>
    /// checks which database provider can be connected to with the provided parameters.
    /// </summary>
    /// <param name="host"></param>
    /// <param name="port"></param>
    /// <param name="databaseName"></param>
    /// <param name="username"></param>
    /// <param name="password"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<string?> ResolveAsync(string host,
        ushort port,
        string databaseName,
        string username,
        string password,
        CancellationToken cancellationToken = default);
}
