using FluentValidation;
using HomeBook.Backend.Abstractions.Contracts;
using HomeBook.Backend.Abstractions.Setup;
using Homebook.Backend.Core.Setup.Models;
using Microsoft.Extensions.Logging;

namespace Homebook.Backend.Core.Setup.Provider;

public class SetupConfigurationProvider(
    ILogger<SetupConfigurationProvider> logger,
    IValidator<EnvironmentConfiguration> environmentValidator)
    : ISetupConfigurationProvider
{
    private Dictionary<EnvironmentVariables, string?>? _valuesByEnum;

    private void LoadEnvironmentConfiguration(IValidator<EnvironmentConfiguration> environmentValidator)
    {
        if (_valuesByEnum is not null)
            return;

        _valuesByEnum = new Dictionary<EnvironmentVariables, string?>();

        _valuesByEnum.Clear();
        EnvironmentConfiguration environmentConfiguration = new(
            Environment.GetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_TYPE)),
            Environment.GetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_FILE)),
            Environment.GetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_HOST)),
            Environment.GetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_PORT)),
            Environment.GetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_NAME)),
            Environment.GetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_USER)),
            Environment.GetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_PASSWORD)),
            Environment.GetEnvironmentVariable(nameof(EnvironmentVariables.HOMEBOOK_USER_NAME)),
            Environment.GetEnvironmentVariable(nameof(EnvironmentVariables.HOMEBOOK_USER_PASSWORD)),
            Environment.GetEnvironmentVariable(nameof(EnvironmentVariables.HOMEBOOK_CONFIGURATION_ACCEPT_LICENSES))
        );
        environmentValidator.ValidateAndThrow(environmentConfiguration);

        foreach (EnvironmentVariables varName in Enum.GetValues<EnvironmentVariables>())
        {
            string? value = Environment.GetEnvironmentVariable(varName.ToString());
            _valuesByEnum[varName] = value;
        }

        // displaying the loaded environment variables for debugging purposes
        logger.LogInformation("Loaded environment variables:");
        foreach (KeyValuePair<EnvironmentVariables, string?> kvp in _valuesByEnum)
        {
            logger.LogInformation("{VariableName}: {Value}", kvp.Key, kvp.Value ?? "null");
        }
    }

    /// <inheritdoc />
    public string? GetValue(EnvironmentVariables name)
    {
        LoadEnvironmentConfiguration(environmentValidator);

        _valuesByEnum!.TryGetValue(name, out string? value);

        return value;
    }

    /// <inheritdoc />
    public T? GetValue<T>(EnvironmentVariables name)
    {
        string? value = GetValue(name);
        if (value is null)
            return default;

        return (T?)Convert.ChangeType(value, typeof(T));
    }
}
