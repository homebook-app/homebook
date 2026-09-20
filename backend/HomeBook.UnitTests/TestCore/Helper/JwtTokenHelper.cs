using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace HomeBook.UnitTests.TestCore.Helper;

public static class JwtTokenHelper
{
    private const string SecretKey = "this-is-a-very-long-secret-key-for-jwt-token-generation";
    private const string Issuer = "HomeBook";
    private const string Audience = "HomeBook";

    public static JwtTokenResult GenerateToken(Guid userId,
        string username,
        DateTime expiresAt,
        bool isAdmin,
        bool removeAdminFlag = false)
    {
        SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes(SecretKey));
        SigningCredentials credentials = new(key, SecurityAlgorithms.HmacSha256);

        List<Claim> claims =
        [
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Name, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat,
                new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64)
        ];

        if (!removeAdminFlag)
            claims.Add(new(ClaimTypes.Role, isAdmin ? "Admin" : "User"));
        if (!removeAdminFlag)
            claims.Add(new Claim("IsAdmin", isAdmin.ToString(), ClaimValueTypes.Boolean));

        JwtSecurityToken token = new(
            issuer: Issuer,
            audience: Audience,
            claims: claims.ToArray(),
            expires: expiresAt,
            signingCredentials: credentials
        );

        JwtSecurityTokenHandler tokenHandler = new();
        string? tokenString = tokenHandler.WriteToken(token);
        string refreshToken = GenerateRefreshToken();

        return new JwtTokenResult
        {
            Token = tokenString,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            UserId = userId,
            Username = username
        };
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}

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
