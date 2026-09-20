using FluentValidation;
using HomeBook.Backend.Abstractions.Setup;
using Homebook.Backend.Core.Setup.Models;
using Homebook.Backend.Core.Setup.Provider;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace HomeBook.UnitTests.Backend.Core.Setup.Provider;

[TestFixture]
public class SetupConfigurationProviderTests
{
    private ILogger<SetupConfigurationProvider> _logger;
    private IValidator<EnvironmentConfiguration> _validator;
    private SetupConfigurationProvider _provider;

    [SetUp]
    public void SetUp()
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
        _logger = factory.CreateLogger<SetupConfigurationProvider>();
        _validator = Substitute.For<IValidator<EnvironmentConfiguration>>();
        _provider = new SetupConfigurationProvider(_logger, _validator);
    }

    [TearDown]
    public void TearDown()
    {
        // Clear all environment variables after each test
        foreach (EnvironmentVariables envVar in Enum.GetValues<EnvironmentVariables>())
        {
            Environment.SetEnvironmentVariable(envVar.ToString(), null);
        }
    }

    [Test]
    public void GetValue_WithValidEnvironmentVariables_ReturnsCorrectValue()
    {
        // Arrange
        const string expectedHost = "localhost";
        const string expectedPort = "3306";
        const string expectedDbName = "homebook";

        Environment.SetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_HOST), expectedHost);
        Environment.SetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_PORT), expectedPort);
        Environment.SetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_NAME), expectedDbName);

        // Act
        var hostResult = _provider.GetValue(EnvironmentVariables.DATABASE_HOST);
        var portResult = _provider.GetValue(EnvironmentVariables.DATABASE_PORT);
        var dbNameResult = _provider.GetValue(EnvironmentVariables.DATABASE_NAME);

        // Assert
        hostResult.ShouldBe(expectedHost);
        portResult.ShouldBe(expectedPort);
        dbNameResult.ShouldBe(expectedDbName);
    }

    [Test]
    public void GetValue_WithNullEnvironmentVariable_ReturnsNull()
    {
        // Arrange
        Environment.SetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_HOST), null);

        // Act
        var result = _provider.GetValue(EnvironmentVariables.DATABASE_HOST);

        // Assert
        result.ShouldBeNull();
    }

    [Test]
    public void GetValue_WithEmptyEnvironmentVariable_ReturnsEmptyString()
    {
        // Arrange
        Environment.SetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_HOST), string.Empty);

        // Act
        var result = _provider.GetValue(EnvironmentVariables.DATABASE_HOST);

        // Assert
        result.ShouldBe(string.Empty);
    }

    [Test]
    public void GetValue_WithAllEnvironmentVariables_ReturnsAllValues()
    {
        // Arrange
        var expectedValues = new Dictionary<EnvironmentVariables, string>
        {
            {
                EnvironmentVariables.DATABASE_HOST, "localhost"
            },
            {
                EnvironmentVariables.DATABASE_PORT, "3306"
            },
            {
                EnvironmentVariables.DATABASE_NAME, "homebook"
            },
            {
                EnvironmentVariables.DATABASE_USER, "dbuser"
            },
            {
                EnvironmentVariables.DATABASE_PASSWORD, "dbpass"
            },
            {
                EnvironmentVariables.HOMEBOOK_USER_NAME, "admin"
            },
            {
                EnvironmentVariables.HOMEBOOK_USER_PASSWORD, "adminpass"
            },
            {
                EnvironmentVariables.HOMEBOOK_CONFIGURATION_ACCEPT_LICENSES, "true"
            },
            {
                EnvironmentVariables.HOMEBOOK_CONFIGURATION_NAME, "test-instance"
            }
        };

        foreach (var kvp in expectedValues)
        {
            Environment.SetEnvironmentVariable(kvp.Key.ToString(), kvp.Value);
        }

        // Act & Assert
        foreach (var kvp in expectedValues)
        {
            var result = _provider.GetValue(kvp.Key);
            result.ShouldBe(kvp.Value);
        }
    }

    [Test]
    public void GetValue_WithMixedNullAndValidValues_ReturnsCorrectValues()
    {
        // Arrange
        Environment.SetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_HOST), "localhost");
        Environment.SetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_PORT), null);
        Environment.SetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_NAME), "homebook");
        Environment.SetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_USER), null);

        // Act
        var hostResult = _provider.GetValue(EnvironmentVariables.DATABASE_HOST);
        var portResult = _provider.GetValue(EnvironmentVariables.DATABASE_PORT);
        var nameResult = _provider.GetValue(EnvironmentVariables.DATABASE_NAME);
        var userResult = _provider.GetValue(EnvironmentVariables.DATABASE_USER);

        // Assert
        hostResult.ShouldBe("localhost");
        portResult.ShouldBeNull();
        nameResult.ShouldBe("homebook");
        userResult.ShouldBeNull();
    }

    [Test]
    public void GetValue_AfterEnvironmentVariableChanges_ReturnsOriginalValues()
    {
        // Arrange
        Environment.SetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_HOST), "original-host");

        // Act - First call loads the configuration
        var firstResult = _provider.GetValue(EnvironmentVariables.DATABASE_HOST);

        // Change environment variable after first load
        Environment.SetEnvironmentVariable(nameof(EnvironmentVariables.DATABASE_HOST), "changed-host");

        // Second call should return cached value
        var secondResult = _provider.GetValue(EnvironmentVariables.DATABASE_HOST);

        // Assert
        firstResult.ShouldBe("original-host");
        secondResult.ShouldBe("original-host"); // Should be cached, not the changed value
    }

    [Test]
    public void GetValue_WithNonExistentEnvironmentVariable_ReturnsNull()
    {
        // Arrange
        // Ensure the environment variable doesn't exist
        Environment.SetEnvironmentVariable(nameof(EnvironmentVariables.HOMEBOOK_CONFIGURATION_NAME), null);

        // Act
        var result = _provider.GetValue(EnvironmentVariables.HOMEBOOK_CONFIGURATION_NAME);

        // Assert
        result.ShouldBeNull();
    }
}
