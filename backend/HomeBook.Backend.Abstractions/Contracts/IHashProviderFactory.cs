namespace HomeBook.Backend.Abstractions.Contracts;

public interface IHashProviderFactory
{
    /// <summary>
    /// Returns the default hash provider (e.g., configured as the system default).
    /// </summary>
    /// <returns></returns>
    IHashProvider CreateDefault();

    /// <summary>
    /// Creates a hash provider for the specified algorithm.
    /// Examples: "Argon2id", "BCrypt", "PBKDF2".
    /// </summary>
    /// <param name="algorithm"></param>
    /// <returns></returns>
    IHashProvider Create(string algorithm);

    /// <summary>
    /// Returns all supported algorithm identifiers.
    /// </summary>
    /// <returns></returns>
    IReadOnlyCollection<string> GetSupportedAlgorithms();

    /// <summary>
    /// Checks if the given algorithm is supported.
    /// </summary>
    /// <param name="algorithm"></param>
    /// <returns></returns>
    bool IsSupported(string algorithm);
}
