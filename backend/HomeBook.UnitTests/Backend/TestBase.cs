using HomeBook.UnitTests.TestCore.Helper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HomeBook.UnitTests.Backend;

public class TestBase
{
    public IConfigurationRoot CreateTestConfiguration()
    {
        IConfigurationRoot configuration = ConfigurationHelper.CreateConfigurationRoot(new Dictionary<string, string>
        {
            ["Environment"] = "UnitTests",
            ["Database:UseInMemory"] = "true",
            ["Database:Provider"] = "SQLITE"
        });

        return configuration;
    }

    public IServiceCollection CreateTestServiceProvider(IConfigurationRoot configuration)
    {
        IServiceCollection serviceCollection = new ServiceCollection()
            .AddLogging(builder =>
            {
                builder.ClearProviders();
                builder.AddConsole();
                builder.SetMinimumLevel(LogLevel.Information);
            })
            .AddSingleton<IConfiguration>(configuration)
            .AddSingleton(configuration);

        return serviceCollection;
    }
}
