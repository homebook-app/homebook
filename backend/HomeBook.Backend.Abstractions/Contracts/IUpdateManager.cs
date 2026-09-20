namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// defines the contract for the update manager
/// </summary>
public interface IUpdateManager
{
    /// <summary>
    /// returns all available updates with version and description
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<Dictionary<Version, string>> GetAvailableUpdatesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// execute all available updates
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task ExecuteAvailableUpdateAsync(CancellationToken cancellationToken = default);
}
