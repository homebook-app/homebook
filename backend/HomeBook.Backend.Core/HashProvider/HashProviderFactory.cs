using HomeBook.Backend.Abstractions.Contracts;

namespace HomeBook.Backend.Core.HashProvider;

/// <inheritdoc />
public class HashProviderFactory : IHashProviderFactory
{
    private readonly Dictionary<string, Func<IHashProvider>> _providers =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["ARGON2ID"] = () => new Argon2IdHashProvider(),
            // ["BCrypt"] = () => new BCryptHashProvider(),
            // ["PBKDF2"] = () => new Pbkdf2HashProvider()
        };

    private readonly string _defaultAlgorithm = "ARGON2ID";

    /// <inheritdoc />
    public IHashProvider CreateDefault() => _providers[_defaultAlgorithm]();

    /// <inheritdoc />
    public IHashProvider Create(string algorithm) =>
        _providers.TryGetValue(algorithm.ToUpperInvariant(), out var factory)
            ? factory()
            : throw new NotSupportedException($"Algorithm '{algorithm}' is not supported.");

    /// <inheritdoc />
    public IReadOnlyCollection<string> GetSupportedAlgorithms() => _providers.Keys.ToList();

    /// <inheritdoc />
    public bool IsSupported(string algorithm) => _providers.ContainsKey(algorithm.ToUpperInvariant());
}
