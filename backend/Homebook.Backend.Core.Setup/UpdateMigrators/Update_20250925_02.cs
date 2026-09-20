using HomeBook.Backend.Abstractions.Contracts;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace Homebook.Backend.Core.Setup.UpdateMigrators;

public class Update_20250925_02(
    ILogger<Update_20250925_02> logger,
    IRuntimeConfigurationProvider runtimeConfigurationProvider) : IUpdateMigrator
{
    /// <inheritdoc />
    public Version Version { get; } = new(1, 0, 96, 2);

    /// <inheritdoc />
    public string Description { get; } = "Generate JWT secretKey if not set";

    /// <inheritdoc />
    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        // Generate a cryptographically secure JWT secret key
        string jwtSecretKey = GenerateSecureJwtSecretKey();

        await runtimeConfigurationProvider.UpdateConfigurationAsync(
            "Jwt:SecretKey",
            jwtSecretKey,
            cancellationToken);

        logger.LogInformation("JWT Secret Key generated and updated successfully");
    }

    /// <summary>
    /// Generates a cryptographically secure JWT secret key
    /// </summary>
    /// <returns>Base64 encoded secret key string</returns>
    private static string GenerateSecureJwtSecretKey()
    {
        // Generate 256 bits (32 bytes) of random data for a strong secret key
        const int keyLength = 32;
        byte[] keyBytes = new byte[keyLength];

        using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(keyBytes);
        }

        // Convert to Base64 string for storage
        return Convert.ToBase64String(keyBytes);
    }
}
