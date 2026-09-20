namespace HomeBook.Backend.Abstractions.Models;

/// <summary>
/// Result model for JWT token generation
/// </summary>
public record JwtTokenResult
{
    /// <summary>
    /// The JWT access token
    /// </summary>
    public required string Token { get; init; }

    /// <summary>
    /// The refresh token
    /// </summary>
    public required string RefreshToken { get; init; }

    /// <summary>
    /// Token expiration date and time
    /// </summary>
    public required DateTime ExpiresAt { get; init; }

    /// <summary>
    /// User ID associated with the token
    /// </summary>
    public required Guid UserId { get; init; }

    /// <summary>
    /// Username associated with the token
    /// </summary>
    public required string Username { get; init; }
}
