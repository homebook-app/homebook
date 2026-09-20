namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// defines a provider for hashing and verifying hashes
/// </summary>
public interface IHashProvider
{
    /// <summary>
    /// the name of the hashing algorithm
    /// </summary>
    string AlgorithmName { get; }

    /// <summary>
    /// creates a hash from the given input
    /// </summary>
    /// <param name="input"></param>
    /// <returns></returns>
    string Hash(string input);

    /// <summary>
    /// verifies if the given input matches the given hash
    /// </summary>
    /// <param name="input"></param>
    /// <param name="hash"></param>
    /// <returns></returns>
    bool Verify(string input, string hash);
}
