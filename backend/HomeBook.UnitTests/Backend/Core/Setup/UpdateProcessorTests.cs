using HomeBook.Backend.Abstractions.Contracts;
using Homebook.Backend.Core.Setup;
using Homebook.Backend.Core.Setup.Exceptions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace HomeBook.UnitTests.Backend.Core.Setup;

[TestFixture]
public class UpdateProcessorTests
{
    private CancellationToken _cancellationToken;
    private ILogger<UpdateProcessor> _logger;
    private IConfiguration _configuration;
    private ISetupInstanceManager _setupInstanceManager;
    private IUpdateManager _updateManager;
    private IDatabaseMigratorFactory _databaseMigratorFactory;
    private IDatabaseMigrator _databaseMigrator;
    private UpdateProcessor _instance;

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
        _logger = factory.CreateLogger<UpdateProcessor>();
        _configuration = Substitute.For<IConfiguration>();
        _setupInstanceManager = Substitute.For<ISetupInstanceManager>();
        _updateManager = Substitute.For<IUpdateManager>();
        _databaseMigratorFactory = Substitute.For<IDatabaseMigratorFactory>();
        _databaseMigrator = Substitute.For<IDatabaseMigrator>();

        _instance = new UpdateProcessor(
            _logger,
            _configuration,
            _setupInstanceManager,
            _updateManager,
            _databaseMigratorFactory);
    }

    [Test]
    public async Task ProcessAsync_ValidConfiguration_ExecutesAllSteps()
    {
        // Arrange
        _configuration["Database:Provider"].Returns("PostgreSql");
        _databaseMigratorFactory.CreateMigrator("PostgreSql").Returns(_databaseMigrator);

        // Act
        await _instance.ProcessAsync(_cancellationToken);

        // Assert
        // 1. Verify directory creation
        _setupInstanceManager.Received(1).CreateRequiredDirectories();

        // 2. Verify database migration
        _databaseMigratorFactory.Received(1).CreateMigrator("PostgreSql");
        await _databaseMigrator.Received(1).MigrateAsync(_cancellationToken);

        // 3. Verify update execution
        await _updateManager.Received(1).ExecuteAvailableUpdateAsync(_cancellationToken);

        // 4. Verify instance creation
        await _setupInstanceManager.Received(1).CreateHomebookInstanceAsync(_cancellationToken);
    }

    [Test]
    public async Task ProcessAsync_NoDatabaseProvider_ThrowsSetupException()
    {
        // Arrange
        _configuration["Database:Provider"].Returns((string?)null);

        // Act & Assert
        var exception = await Should.ThrowAsync<SetupException>(async () =>
            await _instance.ProcessAsync(_cancellationToken));

        exception.Message.ShouldBe("database provider is not configured");

        // Verify that directory creation was called but subsequent steps were not
        _setupInstanceManager.DidNotReceive().CreateRequiredDirectories();
        _databaseMigratorFactory.DidNotReceive().CreateMigrator(Arg.Any<string>());
        await _updateManager.DidNotReceive().ExecuteAvailableUpdateAsync(Arg.Any<CancellationToken>());
        await _setupInstanceManager.DidNotReceive().CreateHomebookInstanceAsync(Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task ProcessAsync_EmptyDatabaseProvider_ThrowsSetupException()
    {
        // Arrange
        _configuration["Database:Provider"].Returns(string.Empty);

        // Act & Assert
        var exception = await Should.ThrowAsync<SetupException>(async () =>
            await _instance.ProcessAsync(_cancellationToken));

        exception.Message.ShouldBe("database provider is not configured");

        // Verify that directory creation was called but subsequent steps were not
        _setupInstanceManager.DidNotReceive().CreateRequiredDirectories();
        _databaseMigratorFactory.DidNotReceive().CreateMigrator(Arg.Any<string>());
        await _updateManager.DidNotReceive().ExecuteAvailableUpdateAsync(Arg.Any<CancellationToken>());
        await _setupInstanceManager.DidNotReceive().CreateHomebookInstanceAsync(Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task ProcessAsync_DatabaseMigrationFails_ThrowsSetupException()
    {
        // Arrange
        _configuration["Database:Provider"].Returns("MySql");
        _databaseMigratorFactory.CreateMigrator("MySql").Returns(_databaseMigrator);
        _databaseMigrator.MigrateAsync(_cancellationToken)
            .ThrowsAsync(new InvalidOperationException("Database connection failed"));

        // Act & Assert
        var exception = await Should.ThrowAsync<SetupException>(async () =>
            await _instance.ProcessAsync(_cancellationToken));

        exception.Message.ShouldBe("Error during update process, update aborted");

        // Verify that steps before database migration were called
        _setupInstanceManager.Received(1).CreateRequiredDirectories();
        _databaseMigratorFactory.Received(1).CreateMigrator("MySql");
        await _databaseMigrator.Received(1).MigrateAsync(_cancellationToken);

        // Verify that steps after database migration were not called
        await _updateManager.DidNotReceive().ExecuteAvailableUpdateAsync(Arg.Any<CancellationToken>());
        await _setupInstanceManager.DidNotReceive().CreateHomebookInstanceAsync(Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task ProcessAsync_UpdateExecutionFails_ThrowsException()
    {
        // Arrange
        _configuration["Database:Provider"].Returns("PostgreSql");
        _databaseMigratorFactory.CreateMigrator("PostgreSql").Returns(_databaseMigrator);
        _updateManager.ExecuteAvailableUpdateAsync(_cancellationToken)
            .ThrowsAsync(new SetupException("Update failed"));

        // Act & Assert
        var exception = await Should.ThrowAsync<SetupException>(async () =>
            await _instance.ProcessAsync(_cancellationToken));

        exception.Message.ShouldBe("Error during update process, update aborted");

        // Verify that steps before update execution were called
        _setupInstanceManager.Received(1).CreateRequiredDirectories();
        _databaseMigratorFactory.Received(1).CreateMigrator("PostgreSql");
        await _databaseMigrator.Received(1).MigrateAsync(_cancellationToken);
        await _updateManager.Received(1).ExecuteAvailableUpdateAsync(_cancellationToken);

        // Verify that instance creation was not called
        await _setupInstanceManager.DidNotReceive().CreateHomebookInstanceAsync(Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task ProcessAsync_InstanceCreationFails_ThrowsException()
    {
        // Arrange
        _configuration["Database:Provider"].Returns("PostgreSql");
        _databaseMigratorFactory.CreateMigrator("PostgreSql").Returns(_databaseMigrator);
        _setupInstanceManager.CreateHomebookInstanceAsync(_cancellationToken)
            .ThrowsAsync(new InvalidOperationException("Failed to create instance"));

        // Act & Assert
        var exception = await Should.ThrowAsync<SetupException>(async () =>
            await _instance.ProcessAsync(_cancellationToken));

        exception.Message.ShouldBe("Error during update process, update aborted");

        // Verify that all steps were called
        _setupInstanceManager.Received(1).CreateRequiredDirectories();
        _databaseMigratorFactory.Received(1).CreateMigrator("PostgreSql");
        await _databaseMigrator.Received(1).MigrateAsync(_cancellationToken);
        await _updateManager.Received(1).ExecuteAvailableUpdateAsync(_cancellationToken);
        await _setupInstanceManager.Received(1).CreateHomebookInstanceAsync(_cancellationToken);
    }

    [TestCase("PostgreSql")]
    [TestCase("MySql")]
    [TestCase("Sqlite")]
    public async Task ProcessAsync_DifferentDatabaseProviders_ExecutesCorrectly(string databaseProvider)
    {
        // Arrange
        _configuration["Database:Provider"].Returns(databaseProvider);
        _databaseMigratorFactory.CreateMigrator(databaseProvider).Returns(_databaseMigrator);

        // Act
        await _instance.ProcessAsync(_cancellationToken);

        // Assert
        _databaseMigratorFactory.Received(1).CreateMigrator(databaseProvider);
        await _databaseMigrator.Received(1).MigrateAsync(_cancellationToken);
    }

    [Test]
    public async Task ProcessAsync_DirectoryCreationFails_ThrowsException()
    {
        // Arrange
        _setupInstanceManager.When(x => x.CreateRequiredDirectories())
            .Do(x => throw new UnauthorizedAccessException("Access denied"));

        // Act & Assert
        var exception = await Should.ThrowAsync<SetupException>(async () =>
            await _instance.ProcessAsync(_cancellationToken));

        exception.Message.ShouldBe("database provider is not configured");

        // Verify that only directory creation was attempted
        _setupInstanceManager.DidNotReceive().CreateRequiredDirectories();
        _databaseMigratorFactory.DidNotReceive().CreateMigrator(Arg.Any<string>());
        await _updateManager.DidNotReceive().ExecuteAvailableUpdateAsync(Arg.Any<CancellationToken>());
        await _setupInstanceManager.DidNotReceive().CreateHomebookInstanceAsync(Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task ProcessAsync_AllStepsExecuteInCorrectOrder()
    {
        // Arrange
        _configuration["Database:Provider"].Returns("PostgreSql");
        _databaseMigratorFactory.CreateMigrator("PostgreSql").Returns(_databaseMigrator);

        var callOrder = new List<string>();

        _setupInstanceManager.When(x => x.CreateRequiredDirectories())
            .Do(x => callOrder.Add("CreateRequiredDirectories"));

        _databaseMigrator.When(x => x.MigrateAsync(_cancellationToken))
            .Do(x => callOrder.Add("MigrateAsync"));

        _updateManager.When(x => x.ExecuteAvailableUpdateAsync(_cancellationToken))
            .Do(x => callOrder.Add("ExecuteAvailableUpdateAsync"));

        _setupInstanceManager.When(x => x.CreateHomebookInstanceAsync(_cancellationToken))
            .Do(x => callOrder.Add("CreateHomebookInstanceAsync"));

        // Act
        await _instance.ProcessAsync(_cancellationToken);

        // Assert
        callOrder.ShouldBe(new[]
        {
            "CreateRequiredDirectories",
            "MigrateAsync",
            "ExecuteAvailableUpdateAsync",
            "CreateHomebookInstanceAsync"
        });
    }
}
