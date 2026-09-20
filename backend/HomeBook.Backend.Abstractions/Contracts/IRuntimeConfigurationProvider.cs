namespace HomeBook.Backend.Abstractions.Contracts;

public interface IRuntimeConfigurationProvider
{
    /// <summary>
    /// updates the given value by the given key in the application configuration.
    /// </summary>
    /// <param name="key">the key of the configuration value to update. it must be in the format "section:key"</param>
    /// <param name="value">the new value to set for the given key</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdateConfigurationAsync(string key, object value, CancellationToken cancellationToken = default);
}
