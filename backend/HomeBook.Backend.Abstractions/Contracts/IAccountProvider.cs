using HomeBook.Backend.Abstractions.Models;

namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// Provider for account management operations
/// </summary>
public interface IAccountProvider
{
    /// <summary>
    /// Authenticates a user with username and password
    /// </summary>
    /// <param name="username">The username</param>
    /// <param name="password">The plain text password</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>JWT token result if authentication is successful, null otherwise</returns>
    Task<JwtTokenResult?> LoginAsync(string username, string password, CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs out a user by invalidating their token
    /// </summary>
    /// <param name="token">The JWT token to invalidate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if logout was successful, false otherwise</returns>
    Task<bool> LogoutAsync(string token, CancellationToken cancellationToken = default);
}
