namespace HomeBook.Frontend.Abstractions.Contracts;

/// <summary>
/// Provides access to the browser's localStorage API
/// </summary>
public interface IJsLocalStorageProvider
{
    /// <summary>
    /// Sets a value in localStorage
    /// </summary>
    /// <param name="key">The key to store the value under</param>
    /// <param name="value">The value to store</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the asynchronous operation</returns>
    Task SetItemAsync(string key, string value, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a value from localStorage
    /// </summary>
    /// <param name="key">The key to retrieve the value for</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The value associated with the key, or null if not found</returns>
    Task<string?> GetItemAsync(string key, CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes an item from localStorage
    /// </summary>
    /// <param name="key">The key of the item to remove</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the asynchronous operation</returns>
    Task RemoveItemAsync(string key, CancellationToken cancellationToken = default);

    /// <summary>
    /// Clears all items from localStorage
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the asynchronous operation</returns>
    Task ClearAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the number of items in localStorage
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The number of items in localStorage</returns>
    Task<int> GetLengthAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the key at the specified index in localStorage
    /// </summary>
    /// <param name="index">The index of the key to retrieve</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The key at the specified index, or null if not found</returns>
    Task<string?> GetKeyAsync(int index, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a key exists in localStorage
    /// </summary>
    /// <param name="key">The key to check for</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if the key exists, false otherwise</returns>
    Task<bool> ContainsKeyAsync(string key, CancellationToken cancellationToken = default);
}
