namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// defines the configuration provider
/// </summary>
public interface IInstanceConfigurationProvider
{
    /// <summary>
    /// set the homebook instance name to the configuration
    /// </summary>
    /// <param name="instanceName"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task SetHomeBookInstanceNameAsync(string instanceName, CancellationToken cancellationToken = default);

    /// <summary>
    /// gets the homebook instance name from the configuration
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns>the instance name or null if not set</returns>
    Task<string> GetHomeBookInstanceNameAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// set the default locale for the homebook instance
    /// </summary>
    /// <param name="defaultLocale"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task SetHomeBookInstanceDefaultLocaleAsync(string defaultLocale, CancellationToken cancellationToken = default);

    /// <summary>
    /// gets the default locale for the homebook instance
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns>the instance name or null if not set</returns>
    Task<string?> GetHomeBookInstanceDefaultLocaleAsync(CancellationToken cancellationToken = default);
}
