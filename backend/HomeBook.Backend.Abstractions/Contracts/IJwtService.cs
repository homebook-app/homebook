using HomeBook.Backend.Abstractions.Models;

namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// Service for JWT token operations
/// </summary>
public interface IJwtService
{
    /// <summary>
    /// Generates a JWT token for the given user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="username">The username</param>
    /// <returns>A JWT token result</returns>
    JwtTokenResult GenerateToken(Guid userId, string username);

    /// <summary>
    /// Generates a JWT token for the given user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="username">The username</param>
    /// <param name="isAdmin">Whether the user has admin rights</param>
    /// <returns>A JWT token result</returns>
    JwtTokenResult GenerateToken(Guid userId, string username, bool isAdmin);

    /// <summary>
    /// Validates a JWT token
    /// </summary>
    /// <param name="token">The token to validate</param>
    /// <returns>True if the token is valid, false otherwise</returns>
    bool ValidateToken(string token);

    /// <summary>
    /// Extracts the user ID from a JWT token
    /// </summary>
    /// <param name="token">The JWT token</param>
    /// <returns>The user ID if valid, null otherwise</returns>
    Guid? GetUserIdFromToken(string token);

    /// <summary>
    /// Extracts whether the user is an admin from a JWT token
    /// </summary>
    /// <param name="token">The JWT token</param>
    /// <returns>True if the user is admin, false otherwise</returns>
    bool IsAdminFromToken(string token);
}
