namespace HomeBook.Frontend.Abstractions.Contracts;

/// <summary>
/// defines methods to manage the homebook instance
/// </summary>
public interface IInstanceManagementProvider
{
    /// <summary>
    /// returns the name of the homebook instance
    /// </summary>
    /// <returns></returns>
    Task<string> GetInstanceNameAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// returns the language code of the default locale (en-EN, de-DE, ...)
    /// </summary>
    /// <returns></returns>
    Task<string> GetDefaultLocaleAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// updates the name of the homebook instance
    /// </summary>
    /// <param name="newName"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdateInstanceNameAsync(string newName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// updates the default locale of the homebook instance
    /// </summary>
    /// <param name="locale">the language code of the locale (en-EN, de-DE, ...)</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdateDefaultLocaleAsync(string locale,
        CancellationToken cancellationToken = default);
}
