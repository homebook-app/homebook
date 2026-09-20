using HomeBook.Backend.Abstractions;
using HomeBook.Backend.Abstractions.Contracts;
using HomeBook.Backend.Provider;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace HomeBook.UnitTests.Backend;

[TestFixture]
public class RuntimeConfigurationProviderTests
{
    private ILogger<RuntimeConfigurationProvider> _logger;
    private IApplicationPathProvider _applicationPathProvider = null!;
    private IFileSystemService _fileSystemService = null!;
    private RuntimeConfigurationProvider _instance = null!;

    [SetUp]
    public void SetUpSubstitutes()
    {
        var factory = LoggerFactory.Create(builder =>
        {
            builder.AddSimpleConsole(options =>
                {
                    options.IncludeScopes = true;
                    options.SingleLine = true;
                    options.TimestampFormat = "HH:mm:ss ";
                })
                .SetMinimumLevel(LogLevel.Debug);
        });

        _logger = factory.CreateLogger<RuntimeConfigurationProvider>();
        _applicationPathProvider = Substitute.For<IApplicationPathProvider>();
        _fileSystemService = Substitute.For<IFileSystemService>();
        _instance = new RuntimeConfigurationProvider(_logger,
            _applicationPathProvider,
            _fileSystemService);
    }

    [Test]
    public async Task HandleGetAvailability_returns_Conflict_when_instance_exists()
    {
        // Arrange
        var configFilePath = "config.json";
        _applicationPathProvider.RuntimeConfigurationFilePath
            .Returns(configFilePath);
        _fileSystemService.FileExists(configFilePath)
            .Returns(true);
        _fileSystemService.FileExists(configFilePath)
            .Returns(true);
        var actual = """
                     {
                         "instance": {
                             "id": "12345",
                             "name": "Test Instance"
                         }
                     }
                     """;
        _fileSystemService.FileReadAllTextAsync(configFilePath, Arg.Any<CancellationToken>())
            .Returns(actual);

        // Act
        await _instance.UpdateConfigurationAsync("Database:Test:Section:Section",
            "a-value",
            CancellationToken.None);

        // Assert
        await _fileSystemService.Received(1)
            .FileWriteAllTextAsync(Arg.Is<string>(path => path == configFilePath),
                Arg.Is<string>(json =>
                    json.Contains("\"Database\"") &&
                    json.Contains("\"Test\"") &&
                    json.Contains("\"Section\"") &&
                    json.Contains("\"Section\": \"a-value\"") &&
                    json.Contains("\"instance\"") &&
                    json.Contains("\"id\": \"12345\"") &&
                    json.Contains("\"name\": \"Test Instance\"")
                ),
                Arg.Any<CancellationToken>());
    }
}
