using Microsoft.Extensions.Configuration;

namespace HomeBook.UnitTests.TestCore.Helper;

public static class ConfigurationHelper
{
    public static IConfigurationRoot CreateConfigurationRoot(Dictionary<string, string>? inMemorySettings = null)
    {
        IConfigurationBuilder configurationBuilder = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

        if (inMemorySettings is not null)
            configurationBuilder.AddInMemoryCollection(inMemorySettings!);

        return configurationBuilder.Build();
    }
}
