using FluentDataBuilder;
using FluentDataBuilder.Microsoft.Extensions.Configuration;
using HomeBook.Backend.Abstractions.Contracts;
using HomeBook.Backend.Abstractions.Models;
using HomeBook.Backend.Abstractions.Setup;
using Homebook.Backend.Core.Setup;
using Homebook.Backend.Core.Setup.Exceptions;
using HomeBook.Backend.Data.PostgreSql;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace HomeBook.UnitTests.Backend.Core.Setup;

[TestFixture]
public class SetupProcessorTests
{
    private CancellationToken _cancellationToken;
    private ILogger<SetupProcessor> _logger;
    private IDatabaseMigratorFactory _databaseMigratorFactory;
    private IHashProviderFactory _hashProviderFactory;
    private ILoggerFactory _loggerFactory;
    private IConfiguration _injectedConfiguration;
    private IFileSystemService _fileSystemService;
    private IApplicationPathProvider _applicationPathProvider;
    private IRuntimeConfigurationProvider _runtimeConfigurationProvider;
    private SetupProcessor _instance;

    [SetUp]
    public void SetUp()
    {
        _cancellationToken = CancellationToken.None;
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
        _logger = factory.CreateLogger<SetupProcessor>();
        _databaseMigratorFactory = Substitute.For<IDatabaseMigratorFactory>();
        _hashProviderFactory = Substitute.For<IHashProviderFactory>();
        _loggerFactory = Substitute.For<ILoggerFactory>();
        _injectedConfiguration = Substitute.For<IConfiguration>();
        _fileSystemService = Substitute.For<IFileSystemService>();
        _applicationPathProvider = Substitute.For<IApplicationPathProvider>();
        _runtimeConfigurationProvider = Substitute.For<IRuntimeConfigurationProvider>();

        _instance = new SetupProcessor(_databaseMigratorFactory,
            _hashProviderFactory,
            _loggerFactory,
            _injectedConfiguration,
            _fileSystemService,
            _applicationPathProvider,
            _runtimeConfigurationProvider);
    }

    [TearDown]
    public void TearDown()
    {
        _loggerFactory?.Dispose();
    }

    [Test]
    public void ProcessAsync_WithoutDatabaseType_Throws()
    {
        // Arrange
        var setupConfiguration = new SetupConfiguration()
        {
            DatabaseType = "POSTGRESQL",
            DatabaseHost = "192.168.0.1",
            DatabasePort = 5432,
            DatabaseName = "homebook",
            DatabaseUserName = "user",
            DatabaseUserPassword = "password",
            HomebookConfigurationName = "my homebook",
            HomebookConfigurationDefaultLocale = "EN",
            HomebookUserName = "admin",
            HomebookUserPassword = "password",
            HomebookAcceptLicenses = true
        };
        var _configuration = new DataBuilder()
            .ToConfiguration();

        // Act
        var exception = Should.Throw<SetupException>(() => _instance.ProcessAsync(_configuration,
            setupConfiguration,
            _cancellationToken));

        // Assert
        exception.Message.ShouldContain("database provider is not configured");
    }
}
