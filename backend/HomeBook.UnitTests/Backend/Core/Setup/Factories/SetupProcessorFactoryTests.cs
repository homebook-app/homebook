using FluentValidation;
using HomeBook.Backend.Abstractions.Contracts;
using Homebook.Backend.Core.Setup;
using HomeBook.Backend.Data.Entities;
using Homebook.Backend.Core.Setup.Factories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace HomeBook.UnitTests.Backend.Core.Setup.Factories;

[TestFixture]
public class SetupProcessorFactoryTests
{
    private IDatabaseMigratorFactory _databaseMigratorFactory;
    private IHashProviderFactory _hashProviderFactory;
    private ILoggerFactory _loggerFactory;
    private IConfiguration _injectedConfiguration;
    private IFileSystemService _fileSystemService;
    private IApplicationPathProvider _applicationPathProvider;
    private IRuntimeConfigurationProvider _runtimeConfigurationProvider;
    private SetupProcessorFactory _factory;

    [SetUp]
    public void SetUp()
    {
        _databaseMigratorFactory = Substitute.For<IDatabaseMigratorFactory>();
        _hashProviderFactory = Substitute.For<IHashProviderFactory>();
        _loggerFactory = Substitute.For<ILoggerFactory>();
        _injectedConfiguration = Substitute.For<IConfiguration>();
        _fileSystemService = Substitute.For<IFileSystemService>();
        _applicationPathProvider = Substitute.For<IApplicationPathProvider>();
        _runtimeConfigurationProvider = Substitute.For<IRuntimeConfigurationProvider>();

        _factory = new SetupProcessorFactory(
            _databaseMigratorFactory,
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
    public void Create_MultipleCallsWithSameDependencies_ShouldReturnDifferentInstances()
    {
        // Arrange
        var instances = new List<ISetupProcessor>();

        // Act
        for (int i = 0; i < 5; i++)
        {
            instances.Add(_factory.Create());
        }

        // Assert
        instances.ShouldAllBe(instance => instance != null);
        instances.ShouldAllBe(instance => instance is SetupProcessor);

        // Verify all instances are different
        for (int i = 0; i < instances.Count; i++)
        {
            for (int j = i + 1; j < instances.Count; j++)
            {
                instances[i].ShouldNotBeSameAs(instances[j]);
            }
        }
    }
}
