using HomeBook.Frontend.Abstractions.Contracts;
using Microsoft.JSInterop;

namespace HomeBook.Frontend.Services.Provider;

/// <summary>
/// Implementation of IJsLocalStorageProvider that provides direct access to browser's localStorage API
/// </summary>
public class JsLocalStorageProvider(IJSRuntime jsRuntime) : IJsLocalStorageProvider
{
    private const string LocalStorageSetItem = "localStorage.setItem";
    private const string LocalStorageGetItem = "localStorage.getItem";
    private const string LocalStorageRemoveItem = "localStorage.removeItem";
    private const string LocalStorageClear = "localStorage.clear";
    private const string LocalStorageKey = "localStorage.key";
    private const string LocalStorageLength = "localStorage.length";

    /// <inheritdoc />
    public async Task SetItemAsync(string key, string value, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);
        ArgumentNullException.ThrowIfNull(value);

        await jsRuntime.InvokeVoidAsync(LocalStorageSetItem, cancellationToken, key, value);
    }

    /// <inheritdoc />
    public async Task<string?> GetItemAsync(string key, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        return await jsRuntime.InvokeAsync<string?>(LocalStorageGetItem, cancellationToken, key);
    }

    /// <inheritdoc />
    public async Task RemoveItemAsync(string key, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        await jsRuntime.InvokeVoidAsync(LocalStorageRemoveItem, cancellationToken, key);
    }

    /// <inheritdoc />
    public async Task ClearAsync(CancellationToken cancellationToken = default)
    {
        await jsRuntime.InvokeVoidAsync(LocalStorageClear, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<int> GetLengthAsync(CancellationToken cancellationToken = default)
    {
        return await jsRuntime.InvokeAsync<int>(LocalStorageLength, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<string?> GetKeyAsync(int index, CancellationToken cancellationToken = default)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(index);

        return await jsRuntime.InvokeAsync<string?>(LocalStorageKey, cancellationToken, index);
    }

    /// <inheritdoc />
    public async Task<bool> ContainsKeyAsync(string key, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        string? value = await GetItemAsync(key, cancellationToken);
        return value is not null;
    }
}
