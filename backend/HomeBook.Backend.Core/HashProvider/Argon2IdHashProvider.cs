using HomeBook.Backend.Abstractions.Contracts;
using Isopoh.Cryptography.Argon2;

namespace HomeBook.Backend.Core.HashProvider;

/// <inheritdoc />
public sealed class Argon2IdHashProvider : IHashProvider
{
    /// <inheritdoc />
    public string AlgorithmName => "Argon2Id";

    /// <inheritdoc />
    public string Hash(string input) => Argon2.Hash(input);

    /// <inheritdoc />
    public bool Verify(string input, string hash) => Argon2.Verify(hash, input);
}
