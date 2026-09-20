using HomeBook.Backend.Abstractions.Contracts;
using HomeBook.Backend.Abstractions.Setup;
using Microsoft.Extensions.Logging;

namespace Homebook.Backend.Core.Setup.UpdateMigrators;

public class Update_20250925_01(
    ILogger<Update_20250925_01> logger,
    IInstanceConfigurationProvider instanceConfigurationProvider) : IUpdateMigrator
{
    /// <inheritdoc />
    public Version Version { get; } = new(1, 0, 96, 1);

    /// <inheritdoc />
    public string Description { get; } = "Set Default Language if not set";

    /// <inheritdoc />
    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        string? existingDefaultLanguage = await instanceConfigurationProvider
            .GetHomeBookInstanceDefaultLocaleAsync(cancellationToken);

        if (!string.IsNullOrEmpty(existingDefaultLanguage))
            return;

        // update users and add created timestamp
        logger.LogInformation("Updating Default Language");

        // TODO: try to load load from env
        string defaultLang = "en-EN";
        await instanceConfigurationProvider.SetHomeBookInstanceDefaultLocaleAsync(
            defaultLang,
            cancellationToken);
    }
}
