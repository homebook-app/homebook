using System.Text.Json;
using HomeBook.Backend.Abstractions.Contracts;
using Homebook.Backend.Core.Setup;
using Homebook.Backend.Core.Setup.Exceptions;
using HomeBook.UnitTests.TestCore.Backend.Core.Setup;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace HomeBook.UnitTests.Backend.Core.Setup;

[TestFixture]
public class UpdateManagerTests
{
    private CancellationToken _cancellationToken;
    private ILogger<UpdateManager> _logger;
    private IEnumerable<IUpdateMigrator> _availableUpdateMigrators;
    private IApplicationPathProvider _applicationPathProvider;
    private IFileSystemService _fileSystemService;
    private UpdateManager _instance;

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
        _logger = factory.CreateLogger<UpdateManager>();
        _availableUpdateMigrators = Substitute.For<IEnumerable<IUpdateMigrator>>();
        _applicationPathProvider = Substitute.For<IApplicationPathProvider>();
        _fileSystemService = Substitute.For<IFileSystemService>();
        _instance = new UpdateManager(_logger,
            _availableUpdateMigrators,
            _applicationPathProvider,
            _fileSystemService);
    }

    [Test]
    public async Task GetAvailableUpdatesAsync_AfterSetup_Returns()
    {
        // Arrange
        _availableUpdateMigrators = new List<IUpdateMigrator>
        {
            new TestUpdateMigrator("1.0.5", "a short description"),
            new TestUpdateMigrator("1.1.35", "a bigger update"),
            new TestUpdateMigrator("1.0.20", "another description"),
        };
        _instance = new UpdateManager(_logger,
            _availableUpdateMigrators,
            _applicationPathProvider,
            _fileSystemService);
        _fileSystemService
            .FileExists(Path.Combine(_applicationPathProvider.UpdateDirectory, "updates.json"))
            .Returns(false);
        _fileSystemService
            .FileReadAllTextAsync(Path.Combine(_applicationPathProvider.UpdateDirectory, "updates.json"),
                Arg.Any<CancellationToken>())
            .Returns(string.Empty);

        // Act
        Dictionary<Version, string> updates = await _instance.GetAvailableUpdatesAsync(_cancellationToken);

        // Assert
        updates.ShouldNotBeEmpty();
        updates.Count.ShouldBe(3);

        // Verify that updates are returned in ascending version order
        var updateKeys = updates.Keys.ToArray();
        updateKeys[0].ToString().ShouldBe("1.0.5");
        updateKeys[1].ToString().ShouldBe("1.0.20");
        updateKeys[2].ToString().ShouldBe("1.1.35");

        updates.ShouldContain(x => x.Key.ToString() == "1.0.5" && x.Value == "a short description");
        updates.ShouldContain(x => x.Key.ToString() == "1.0.20" && x.Value == "another description");
        updates.ShouldContain(x => x.Key.ToString() == "1.1.35" && x.Value == "a bigger update");
    }

    [Test]
    public async Task GetAvailableUpdatesAsync_NewUpdate_Returns()
    {
        // Arrange
        var versionBeforeUpdate = "1.0.5";
        _availableUpdateMigrators = new List<IUpdateMigrator>
        {
            new TestUpdateMigrator("1.0.5", "a short description"),
            new TestUpdateMigrator("1.1.35", "a bigger update"),
            new TestUpdateMigrator("1.0.20", "another description"),
        };
        _instance = new UpdateManager(_logger,
            _availableUpdateMigrators,
            _applicationPathProvider,
            _fileSystemService);
        _fileSystemService
            .FileExists(Path.Combine(_applicationPathProvider.UpdateDirectory, "updates.json"))
            .Returns(true);
        _fileSystemService
            .FileReadAllTextAsync(Path.Combine(_applicationPathProvider.UpdateDirectory, "updates.json"),
                Arg.Any<CancellationToken>())
            .Returns(JsonSerializer.Serialize(new[] { new Version(versionBeforeUpdate) }));

        // Act
        Dictionary<Version, string> updates = await _instance.GetAvailableUpdatesAsync(_cancellationToken);

        // Assert
        updates.ShouldNotBeEmpty();
        updates.Count.ShouldBe(2);

        // Verify that updates are returned in ascending version order
        var updateKeys = updates.Keys.ToArray();
        updateKeys[0].ToString().ShouldBe("1.0.20");
        updateKeys[1].ToString().ShouldBe("1.1.35");

        updates.ShouldContain(x => x.Key.ToString() == "1.0.20" && x.Value == "another description");
        updates.ShouldContain(x => x.Key.ToString() == "1.1.35" && x.Value == "a bigger update");
    }

    [Test]
    public async Task ExecuteAvailableUpdateAsync_NewUpdate_Returns()
    {
        // Arrange
        var versionBeforeUpdate = "1.0.5";
        var updateMigrator1 = Substitute.For<IUpdateMigrator>();
        updateMigrator1.Version.Returns(new Version("1.0.5"));
        updateMigrator1.Description.Returns("a short description");

        var updateMigrator2 = Substitute.For<IUpdateMigrator>();
        updateMigrator2.Version.Returns(new Version("1.1.35"));
        updateMigrator2.Description.Returns("a bigger update");

        var updateMigrator3 = Substitute.For<IUpdateMigrator>();
        updateMigrator3.Version.Returns(new Version("1.0.20"));
        updateMigrator3.Description.Returns("another description");

        _availableUpdateMigrators = new List<IUpdateMigrator>
        {
            updateMigrator1,
            updateMigrator2,
            updateMigrator3
        };
        _instance = new UpdateManager(_logger,
            _availableUpdateMigrators,
            _applicationPathProvider,
            _fileSystemService);
        _fileSystemService
            .FileExists(Path.Combine(_applicationPathProvider.UpdateDirectory, "updates.json"))
            .Returns(true);
        _fileSystemService
            .FileReadAllTextAsync(Path.Combine(_applicationPathProvider.UpdateDirectory, "updates.json"),
                Arg.Any<CancellationToken>())
            .Returns(JsonSerializer.Serialize(new[] { new Version(versionBeforeUpdate) }));

        // Act
        await _instance.ExecuteAvailableUpdateAsync(_cancellationToken);

        // Assert
        // Version 1.0.5 should NOT be executed (already applied)
        await updateMigrator1.DidNotReceive().ExecuteAsync(Arg.Any<CancellationToken>());

        // Version 1.0.20 should be executed (pending update)
        await updateMigrator3.Received(1).ExecuteAsync(_cancellationToken);

        // Version 1.1.35 should be executed (pending update)
        await updateMigrator2.Received(1).ExecuteAsync(_cancellationToken);
    }

    [Test]
    public async Task ExecuteAvailableUpdateAsync_UpdateThrows_Returns()
    {
        // Arrange
        var updateMigrator1 = Substitute.For<IUpdateMigrator>();
        updateMigrator1.Version.Returns(new Version("1.0.5"));
        updateMigrator1.Description.Returns("a short description");
        updateMigrator1.ExecuteAsync(Arg.Any<CancellationToken>())
            .Returns(Task.FromException(new InvalidOperationException("Update failed")));

        _availableUpdateMigrators = new List<IUpdateMigrator>
        {
            updateMigrator1
        };
        _instance = new UpdateManager(_logger,
            _availableUpdateMigrators,
            _applicationPathProvider,
            _fileSystemService);
        _fileSystemService
            .FileExists(Path.Combine(_applicationPathProvider.UpdateDirectory, "updates.json"))
            .Returns(false);
        _fileSystemService
            .FileReadAllTextAsync(Path.Combine(_applicationPathProvider.UpdateDirectory, "updates.json"),
                Arg.Any<CancellationToken>())
            .Returns(string.Empty);

        // Act & Assert
        var exception = await Should.ThrowAsync<SetupException>(async () =>
            await _instance.ExecuteAvailableUpdateAsync(_cancellationToken));

        exception.Message.ShouldBe("Error during update process, update aborted");

        // Verify that ExecuteAsync was called
        await updateMigrator1.Received(1).ExecuteAsync(_cancellationToken);
    }
}
