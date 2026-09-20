using HomeBook.Backend.Data.Entities;

namespace HomeBook.Backend.Data.Contracts;

/// <summary>
/// defines the contract for configuration repository
/// </summary>
public interface IConfigurationRepository
{
    /// <summary>
    /// writes a configuration key-value pair
    /// </summary>
    /// <param name="configuration"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task WriteConfigurationAsync(Configuration configuration, CancellationToken cancellationToken = default);

    /// <summary>
    /// returns all configurations
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<IReadOnlyList<Configuration>> GetAllConfigurationAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// returns the configuration by key
    /// </summary>
    /// <param name="key"></param>
    /// <param name="cancellationToken"></param>
    /// <param name="appDbContext"></param>
    /// <returns></returns>
    Task<Configuration?> GetConfigurationByKeyAsync(string key,
        CancellationToken cancellationToken = default,
        AppDbContext? appDbContext = null);
}
