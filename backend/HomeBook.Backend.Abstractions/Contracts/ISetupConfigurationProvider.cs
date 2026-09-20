using HomeBook.Backend.Abstractions.Setup;

namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// defines a provider to access setup relevant configuration values.
/// </summary>
public interface ISetupConfigurationProvider
{
    /// <summary>
    /// gets the value of the given environment variable name.
    /// </summary>
    /// <param name="name"></param>
    /// <returns></returns>
    string? GetValue(EnvironmentVariables name);

    /// <summary>
    /// gets the value of the given environment variable name and converts it to the given type.
    /// </summary>
    /// <param name="name"></param>
    /// <typeparam name="T"></typeparam>
    /// <returns></returns>
    T? GetValue<T>(EnvironmentVariables name);
}
