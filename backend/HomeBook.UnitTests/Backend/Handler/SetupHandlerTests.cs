using FluentValidation;
using FluentValidation.Results;
using HomeBook.Backend.Abstractions.Contracts;
using HomeBook.Backend.Abstractions.Models;
using HomeBook.Backend.Abstractions.Setup;
using Homebook.Backend.Core.Setup.Exceptions;
using Homebook.Backend.Core.Setup.Validators;
using HomeBook.Backend.Handler;
using HomeBook.Backend.Requests;
using HomeBook.Backend.Responses;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace HomeBook.UnitTests.Backend.Handler;

[TestFixture]
public class SetupHandlerTests
{
    private ILoggerFactory _loggerFactory = null!;
    private ILogger<SetupHandler> _logger;
    private ISetupInstanceManager _setupInstanceManager = null!;
    private IFileSystemService _fileService = null!;
    private ISetupConfigurationProvider _setupConfigurationProvider = null!;
    private IDatabaseProviderResolver _databaseProviderResolver = null!;
    private IRuntimeConfigurationProvider _runtimeConfigurationProvider = null!;
    private ILicenseProvider _licenseProvider = null!;
    private IHostApplicationLifetime _hostApplicationLifetime = null!;
    private ISetupProcessorFactory _setupProcessorFactory = null!;

    [SetUp]
    public void SetUpSubstitutes()
    {
        _loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddSimpleConsole(options =>
                {
                    options.IncludeScopes = true;
                    options.SingleLine = true;
                    options.TimestampFormat = "HH:mm:ss ";
                })
                .SetMinimumLevel(LogLevel.Debug);
        });

        _logger = _loggerFactory.CreateLogger<SetupHandler>();
        _setupInstanceManager = Substitute.For<ISetupInstanceManager>();
        _fileService = Substitute.For<IFileSystemService>();
        _setupConfigurationProvider = Substitute.For<ISetupConfigurationProvider>();
        _databaseProviderResolver = Substitute.For<IDatabaseProviderResolver>();
        _runtimeConfigurationProvider = Substitute.For<IRuntimeConfigurationProvider>();
        _licenseProvider = Substitute.For<ILicenseProvider>();
        _hostApplicationLifetime = Substitute.For<IHostApplicationLifetime>();
        _setupProcessorFactory = Substitute.For<ISetupProcessorFactory>();
    }

    [TearDown]
    public void TearDown()
    {
        _loggerFactory.Dispose();
    }

    [Test]
    public async Task HandleGetAvailability_SetupNotFinished_Returns()
    {
        // Arrange
        _setupInstanceManager
            .IsHomebookInstanceCreated()
            .Returns(false);

        // Act
        var result = await SetupHandler.HandleGetAvailability(_logger, _setupInstanceManager, CancellationToken.None);

        // Assert
        var ok = result.ShouldBeOfType<Ok>();
        ok.ShouldNotBeNull();
    }

    [Test]
    public async Task HandleGetAvailability_SetupFinishedAndUpdateAvailable_Returns()
    {
        // Arrange
        _setupInstanceManager
            .IsHomebookInstanceCreated()
            .Returns(true);
        _setupInstanceManager
            .IsUpdateRequiredAsync()
            .Returns(true);

        // Act
        var result = await SetupHandler.HandleGetAvailability(_logger, _setupInstanceManager, CancellationToken.None);

        // Assert
        var ok = result.ShouldBeOfType<Created>();
        ok.ShouldNotBeNull();
    }

    [Test]
    public async Task HandleGetAvailability_SetupFinishedAndUpdateNotAvailable_Returns()
    {
        // Arrange
        _setupInstanceManager
            .IsHomebookInstanceCreated()
            .Returns(true);
        _setupInstanceManager
            .IsUpdateRequiredAsync()
            .Returns(false);

        // Act
        var result = await SetupHandler.HandleGetAvailability(_logger, _setupInstanceManager, CancellationToken.None);

        // Assert
        var ok = result.ShouldBeOfType<NoContent>();
        ok.ShouldNotBeNull();
    }

    [Test]
    public async Task HandleGetAvailability_returns_InternalServerError_on_exception()
    {
        // Arrange
        const string boom = "boom";
        _setupInstanceManager
            .IsHomebookInstanceCreated()
            .Throws(new InvalidOperationException(boom));

        // Act
        var result = await SetupHandler.HandleGetAvailability(_logger, _setupInstanceManager, CancellationToken.None);

        // Assert
        var internalError = result.ShouldBeOfType<InternalServerError<string>>();
        internalError.Value.ShouldBe(boom);
    }

    [Test]
    public void HandleGetDatabaseCheck_returns_Ok_with_all_values()
    {
        // Arrange
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_HOST).Returns("db.example.local");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_PORT).Returns("3306");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_NAME).Returns("homebook");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_USER).Returns("hb_user");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_PASSWORD).Returns("s3cr3t");

        // Act
        var result = SetupHandler.HandleGetDatabaseCheck(_logger, _setupConfigurationProvider, CancellationToken.None);

        // Assert
        var ok = result.ShouldBeOfType<Ok<GetDatabaseCheckResponse>>();
        ok.Value.ShouldNotBeNull();
        ok.Value.DatabaseHost.ShouldBe("db.example.local");
        ok.Value.DatabasePort.ShouldBe("3306");
        ok.Value.DatabaseName.ShouldBe("homebook");
        ok.Value.DatabaseUserName.ShouldBe("hb_user");
        ok.Value.DatabaseUserPassword.ShouldBe("s3cr3t");

        // verify the provider was queried for each expected variable exactly once
        _setupConfigurationProvider.Received(1).GetValue(EnvironmentVariables.DATABASE_HOST);
        _setupConfigurationProvider.Received(1).GetValue(EnvironmentVariables.DATABASE_PORT);
        _setupConfigurationProvider.Received(1).GetValue(EnvironmentVariables.DATABASE_NAME);
        _setupConfigurationProvider.Received(1).GetValue(EnvironmentVariables.DATABASE_USER);
        _setupConfigurationProvider.Received(1).GetValue(EnvironmentVariables.DATABASE_PASSWORD);
    }

    [Test]
    public void HandleGetDatabaseCheck_returns_NotFound_ifNotAllIsFilledOut()
    {
        // Arrange: deliberately set some to null and some to empty
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_HOST).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_PORT).Returns(string.Empty);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_NAME).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_USER).Returns(" ");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_PASSWORD).Returns((string?)null);

        // Act
        var result = SetupHandler.HandleGetDatabaseCheck(_logger, _setupConfigurationProvider, CancellationToken.None);

        // Assert: The current implementation always returns Ok with whatever it read
        var ok = result.ShouldBeOfType<NotFound>();
        ok.ShouldNotBeNull();
    }

    [Test]
    public void HandleGetDatabaseCheck_returns_InternalServerError_when_provider_throws()
    {
        // Arrange: throw on first var; could be any
        _setupConfigurationProvider
            .When(x => x.GetValue(EnvironmentVariables.DATABASE_HOST))
            .Do(_ => throw new InvalidOperationException("boom"));

        // Act
        var result = SetupHandler.HandleGetDatabaseCheck(_logger, _setupConfigurationProvider, CancellationToken.None);

        // Assert
        var internalErr = result.ShouldBeOfType<InternalServerError<string>>();
        internalErr.Value.ShouldBe("boom");
    }

    [Test]
    public void HandleGetDatabaseCheck_ThrowsValidationException_Returns()
    {
        // Arrange: throw on first var; could be any
        _setupConfigurationProvider
            .When(x => x.GetValue(EnvironmentVariables.DATABASE_HOST))
            .Do(_ => throw new ValidationException("boom",
                new List<ValidationFailure>
                {
                    new("Property1", "A Error"),
                    new("Property2", "Another Error")
                }));

        // Act
        var result = SetupHandler.HandleGetDatabaseCheck(_logger, _setupConfigurationProvider, CancellationToken.None);

        // Assert
        var badRequestErr = result.ShouldBeOfType<BadRequest<string[]>>();
        badRequestErr.ShouldNotBeNull();
        badRequestErr.Value.ShouldNotBeNull();
        badRequestErr.Value.ShouldContain("Property1, A Error");
        badRequestErr.Value.ShouldContain("Property2, Another Error");
    }

    [Test]
    public async Task HandleCheckDatabase_WithDatabaseIsAvailable_ReturnsHttp200Ok()
    {
        // Arrange
        var databaseHost = "db.example.local";
        var databasePort = (ushort)3306;
        var databaseName = "homebook";
        var databaseUserName = "hb_user";
        var databaseUserPassword = "s3cr3t";
        _databaseProviderResolver.ResolveAsync(databaseHost,
                databasePort,
                databaseName,
                databaseUserName,
                databaseUserPassword,
                Arg.Any<CancellationToken>())
            .Returns("POSTGRESQL");

        // Act
        var request = new CheckDatabaseRequest(databaseHost,
            databasePort,
            databaseName,
            databaseUserName,
            databaseUserPassword);
        var result =
            await SetupHandler.HandleCheckDatabase(request, _logger, _databaseProviderResolver, CancellationToken.None);

        // Assert
        var internalErr = result.ShouldBeOfType<Ok<string>>();
        internalErr.ShouldNotBeNull();
    }

    [Test]
    public async Task HandleCheckDatabase_WithDatabaseIsNotAvailable_ReturnsHttp503ServiceUnavailable()
    {
        // Arrange
        var databaseHost = "db.example.local";
        var databasePort = (ushort)3306;
        var databaseName = "homebook";
        var databaseUserName = "hb_user";
        var databaseUserPassword = "s3cr3t";
        _databaseProviderResolver.ResolveAsync(databaseHost,
                databasePort,
                databaseName,
                databaseUserName,
                databaseUserPassword,
                Arg.Any<CancellationToken>())
            .Returns((string?)null);

        // Act
        var request = new CheckDatabaseRequest(databaseHost,
            databasePort,
            databaseName,
            databaseUserName,
            databaseUserPassword);
        var result =
            await SetupHandler.HandleCheckDatabase(request, _logger, _databaseProviderResolver, CancellationToken.None);

        // Assert
        var internalErr = result.ShouldBeOfType<StatusCodeHttpResult>();
        internalErr.StatusCode.ShouldBe(503); // Service Unavailable
    }

    [Test]
    public async Task HandleCheckDatabase_Throws_ReturnsHttp500InternalServerError()
    {
        // Arrange
        var databaseHost = "db.example.local";
        var databasePort = (ushort)3306;
        var databaseName = "homebook";
        var databaseUserName = "hb_user";
        var databaseUserPassword = "s3cr3t";
        _databaseProviderResolver
            .When(x => x.ResolveAsync(databaseHost,
                databasePort,
                databaseName,
                databaseUserName,
                databaseUserPassword,
                Arg.Any<CancellationToken>()))
            .Do(_ => throw new InvalidOperationException("boom"));

        // Act
        var request = new CheckDatabaseRequest(databaseHost,
            databasePort,
            databaseName,
            databaseUserName,
            databaseUserPassword);
        var result =
            await SetupHandler.HandleCheckDatabase(request, _logger, _databaseProviderResolver, CancellationToken.None);

        // Assert
        var internalErr = result.ShouldBeOfType<InternalServerError<string>>();
        internalErr.Value.ShouldBe("boom");
    }

    [Test]
    public async Task HandleGetLicenses_ReturnsOkWithLicenses_WhenLicensesAreAvailable()
    {
        // Arrange
        var licenses = new[]
        {
            new DependencyLicense("License1", "License-Content"),
            new DependencyLicense("License2", "License-Content")
        };

        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_CONFIGURATION_ACCEPT_LICENSES).Returns("true");
        var licenseProvider = Substitute.For<ILicenseProvider>();
        licenseProvider.GetLicensesAsync(Arg.Any<CancellationToken>()).Returns(licenses);

        // Act
        var result = await SetupHandler.HandleGetLicenses(_logger,
            licenseProvider,
            _setupConfigurationProvider,
            CancellationToken.None);

        // Assert
        var okResult = result.ShouldBeOfType<Ok<GetLicensesResponse>>();
        okResult.Value.ShouldNotBeNull();
        okResult.Value.LicensesAccepted.ShouldBeTrue();
        okResult.Value.Licenses.ShouldBe(licenses);
    }

    [Test]
    public async Task HandleGetLicenses_ReturnsOkWithLicenses_WhenLicensesAreNotAccepted()
    {
        // Arrange
        var licenses = new[]
        {
            new DependencyLicense("License1", "License-Content"),
            new DependencyLicense("License2", "License-Content")
        };

        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_CONFIGURATION_ACCEPT_LICENSES).Returns((string?)null);
        var licenseProvider = Substitute.For<ILicenseProvider>();
        licenseProvider.GetLicensesAsync(Arg.Any<CancellationToken>()).Returns(licenses);

        // Act
        var result = await SetupHandler.HandleGetLicenses(_logger,
            licenseProvider,
            _setupConfigurationProvider,
            CancellationToken.None);

        // Assert
        var okResult = result.ShouldBeOfType<Ok<GetLicensesResponse>>();
        okResult.Value.ShouldNotBeNull();
        okResult.Value.LicensesAccepted.ShouldBeFalse();
        okResult.Value.Licenses.ShouldBe(licenses);
    }

    [Test]
    public async Task HandleGetLicenses_ReturnsInternalServerError_OnException()
    {
        // Arrange
        var licenseProvider = Substitute.For<ILicenseProvider>();
        licenseProvider.GetLicensesAsync(Arg.Any<CancellationToken>()).Throws(new InvalidOperationException("boom"));

        // Act
        var result = await SetupHandler.HandleGetLicenses(_logger,
            licenseProvider,
            _setupConfigurationProvider,
            CancellationToken.None);

        // Assert
        var internalError = result.ShouldBeOfType<InternalServerError<string>>();
        internalError.Value.ShouldBe("boom");
    }

    [Test]
    public void HandleGetPreConfiguredUser_WithUserNameAndPassword_Returns()
    {
        // Arrange
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_USER_NAME)
            .Returns("username");
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_USER_PASSWORD)
            .Returns("s3cr3t");

        // Act
        var result = SetupHandler.HandleGetPreConfiguredUser(_logger,
            _setupConfigurationProvider,
            CancellationToken.None);

        // Assert
        var ok = result.ShouldBeOfType<Ok>();
        ok.ShouldNotBeNull();
    }

    [Test]
    public void HandleGetPreConfiguredUser_WithEmptyUserNameAndPassword_Returns()
    {
        // Arrange
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_USER_NAME)
            .Returns("");
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_USER_PASSWORD)
            .Returns("");

        // Act
        var result = SetupHandler.HandleGetPreConfiguredUser(_logger,
            _setupConfigurationProvider,
            CancellationToken.None);

        // Assert
        var status = result.ShouldBeOfType<StatusCodeHttpResult>();
        status.StatusCode.ShouldBe(404);
        status.ShouldNotBeNull();
    }

    [Test]
    public void HandleGetPreConfiguredUser_WithNullUserNameAndPassword_Returns()
    {
        // Arrange
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_USER_NAME)
            .Returns((string)null!);
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_USER_PASSWORD)
            .Returns((string)null!);

        // Act
        var result =
            SetupHandler.HandleGetPreConfiguredUser(_logger,
                _setupConfigurationProvider,
                CancellationToken.None);

        // Assert
        var status = result.ShouldBeOfType<StatusCodeHttpResult>();
        status.StatusCode.ShouldBe(404);
        status.ShouldNotBeNull();
    }

    [Test]
    public void HandleGetPreConfiguredUser_WithEmptyUserName_Returns()
    {
        // Arrange
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_USER_NAME)
            .Returns("");
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_USER_PASSWORD)
            .Returns("s3cr3t");

        // Act
        var result = SetupHandler.HandleGetPreConfiguredUser(_logger,
            _setupConfigurationProvider,
            CancellationToken.None);

        // Assert
        var status = result.ShouldBeOfType<StatusCodeHttpResult>();
        status.StatusCode.ShouldBe(404);
        status.ShouldNotBeNull();
    }

    [Test]
    public void HandleGetPreConfiguredUser_WithEmptyPassword_Returns()
    {
        // Arrange
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_USER_NAME)
            .Returns("username");
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_USER_PASSWORD)
            .Returns("");

        // Act
        var result = SetupHandler.HandleGetPreConfiguredUser(_logger,
            _setupConfigurationProvider,
            CancellationToken.None);

        // Assert
        var status = result.ShouldBeOfType<StatusCodeHttpResult>();
        status.StatusCode.ShouldBe(404);
        status.ShouldNotBeNull();
    }

    [Test]
    public void HandleGetPreConfiguredUser_WithException_Returns()
    {
        // Arrange
        const string boom = "boom";
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_USER_NAME)
            .Throws(new InvalidOperationException(boom));

        // Act
        var result = SetupHandler.HandleGetPreConfiguredUser(_logger,
            _setupConfigurationProvider,
            CancellationToken.None);

        // Assert
        var status = result.ShouldBeOfType<InternalServerError<string>>();
        status.ShouldNotBeNull();
        status.Value.ShouldBe(boom);
    }

    [Test]
    public void MapConfiguration_WithEnvironmentVariables_Returns_EnvironmentSettings()
    {
        // Arrange
        var startSetupRequest = new StartSetupRequest(
            LicensesAccepted: null,
            DatabaseType: null,
            DatabaseHost: null,
            DatabasePort: null,
            DatabaseName: null,
            DatabaseUserName: null,
            DatabaseUserPassword: null,
            DatabaseFile: null,
            HomebookUserName: null,
            HomebookUserPassword: null,
            HomebookConfigurationName: null,
            HomebookConfigurationDefaultLocale: null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_TYPE).Returns("POSTGRESQL");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_HOST).Returns("test-server");
        _setupConfigurationProvider.GetValue<ushort>(EnvironmentVariables.DATABASE_PORT).Returns((ushort)5432);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_NAME).Returns("test-database");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_USER).Returns("test-user");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_PASSWORD).Returns("test-password");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_CONFIGURATION_NAME).Returns("test-homebook");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_USER_NAME).Returns("user");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_USER_PASSWORD).Returns("s3cr3t");
        _setupConfigurationProvider.GetValue<bool>(EnvironmentVariables.HOMEBOOK_CONFIGURATION_ACCEPT_LICENSES).Returns(true);

        // Act
        var actual = SetupHandler.MapConfiguration(_setupConfigurationProvider, startSetupRequest);

        // Assert
        actual.ShouldNotBeNull();
        actual.DatabaseType.ShouldBe("POSTGRESQL");
        actual.DatabaseHost.ShouldBe("test-server");
        actual.DatabasePort.ShouldBe((ushort)5432);
        actual.DatabaseName.ShouldBe("test-database");
        actual.DatabaseUserName.ShouldBe("test-user");
        actual.DatabaseUserPassword.ShouldBe("test-password");
        actual.HomebookConfigurationName.ShouldBe("test-homebook");
        actual.HomebookUserName.ShouldBe("user");
        actual.HomebookUserPassword.ShouldBe("s3cr3t");
        actual.HomebookAcceptLicenses.ShouldBeTrue();
    }

    [Test]
    public void MapConfiguration_WithRequestVariables_Returns_RequestSettings()
    {
        // Arrange
        var startSetupRequest = new StartSetupRequest(
            LicensesAccepted: true,
            DatabaseType: "POSTGRESQL",
            DatabaseHost: "test-server",
            DatabasePort: (ushort)5432,
            DatabaseName: "test-database",
            DatabaseUserName: "test-user",
            DatabaseUserPassword: "test-password",
            DatabaseFile: null,
            HomebookUserName: "user",
            HomebookUserPassword: "s3cr3t",
            HomebookConfigurationName: "test-homebook",
            HomebookConfigurationDefaultLocale: "EN");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_TYPE).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_HOST).Returns((string?)null);
        _setupConfigurationProvider.GetValue<ushort>(EnvironmentVariables.DATABASE_PORT).Returns((ushort)default);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_NAME).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_USER).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_PASSWORD).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_CONFIGURATION_NAME).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_USER_NAME).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_USER_PASSWORD).Returns((string?)null);
        _setupConfigurationProvider.GetValue<bool>(EnvironmentVariables.HOMEBOOK_CONFIGURATION_ACCEPT_LICENSES)
            .Returns((bool)default);

        // Act
        var actual = SetupHandler.MapConfiguration(_setupConfigurationProvider, startSetupRequest);

        // Assert
        actual.ShouldNotBeNull();
        actual.DatabaseType.ShouldBe("POSTGRESQL");
        actual.DatabaseHost.ShouldBe("test-server");
        actual.DatabasePort.ShouldBe((ushort)5432);
        actual.DatabaseName.ShouldBe("test-database");
        actual.DatabaseUserName.ShouldBe("test-user");
        actual.DatabaseUserPassword.ShouldBe("test-password");
        actual.HomebookConfigurationName.ShouldBe("test-homebook");
        actual.HomebookUserName.ShouldBe("user");
        actual.HomebookUserPassword.ShouldBe("s3cr3t");
        actual.HomebookAcceptLicenses.ShouldBeTrue();
    }

    [Test]
    public void MapConfiguration_WithEnvironmentAndRequestVariables_Returns_RequestSettings()
    {
        // Arrange
        var startSetupRequest = new StartSetupRequest(
            LicensesAccepted: true,
            DatabaseType: "MYSQL",
            DatabaseHost: "another-server",
            DatabasePort: (ushort)3306,
            DatabaseName: "another-database",
            DatabaseUserName: "another-user",
            DatabaseUserPassword: "another-password",
            DatabaseFile: null,
            HomebookUserName: "another-user",
            HomebookUserPassword: "another-s3cr3t",
            HomebookConfigurationName: "another-homebook",
            HomebookConfigurationDefaultLocale: "EN");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_TYPE).Returns("POSTGRESQL");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_HOST).Returns("test-server");
        _setupConfigurationProvider.GetValue<ushort>(EnvironmentVariables.DATABASE_PORT).Returns((ushort)5432);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_NAME).Returns("test-database");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_USER).Returns("test-user");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_PASSWORD).Returns("test-password");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_CONFIGURATION_NAME).Returns("test-homebook");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_USER_NAME).Returns("user");
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_USER_PASSWORD).Returns("s3cr3t");
        _setupConfigurationProvider.GetValue<bool>(EnvironmentVariables.HOMEBOOK_CONFIGURATION_ACCEPT_LICENSES).Returns(true);

        // Act
        var actual = SetupHandler.MapConfiguration(_setupConfigurationProvider, startSetupRequest);

        // Assert
        actual.ShouldNotBeNull();
        actual.DatabaseType.ShouldBe("MYSQL");
        actual.DatabaseHost.ShouldBe("another-server");
        actual.DatabasePort.ShouldBe((ushort)3306);
        actual.DatabaseName.ShouldBe("another-database");
        actual.DatabaseUserName.ShouldBe("another-user");
        actual.DatabaseUserPassword.ShouldBe("another-password");
        actual.HomebookConfigurationName.ShouldBe("another-homebook");
        actual.HomebookUserName.ShouldBe("another-user");
        actual.HomebookUserPassword.ShouldBe("another-s3cr3t");
        actual.HomebookAcceptLicenses.ShouldBeTrue();
    }

    [Test]
    public void MapConfiguration_WithNoVariables_Returns_DefaultSettings()
    {
        // Arrange
        var startSetupRequest = new StartSetupRequest(
            LicensesAccepted: null,
            DatabaseType: null,
            DatabaseHost: null,
            DatabasePort: null,
            DatabaseName: null,
            DatabaseUserName: null,
            DatabaseUserPassword: null,
            HomebookUserName: null,
            HomebookUserPassword: null,
            HomebookConfigurationName: null,
            HomebookConfigurationDefaultLocale: null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_TYPE).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_HOST).Returns((string?)null);
        _setupConfigurationProvider.GetValue<ushort>(EnvironmentVariables.DATABASE_PORT).Returns((ushort)default);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_NAME).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_USER).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.DATABASE_PASSWORD).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_CONFIGURATION_NAME).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_USER_NAME).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_USER_PASSWORD).Returns((string?)null);
        _setupConfigurationProvider.GetValue(EnvironmentVariables.HOMEBOOK_CONFIGURATION_ACCEPT_LICENSES)
            .Returns((string?)null);

        // Act
        var actual = SetupHandler.MapConfiguration(_setupConfigurationProvider, startSetupRequest);

        // Assert
        actual.ShouldNotBeNull();
        actual.DatabaseType.ShouldBe("UNKNOWN");
        actual.DatabaseHost.ShouldBe(null);
        actual.DatabasePort.ShouldBe((ushort)0);
        actual.DatabaseName.ShouldBe(null);
        actual.DatabaseUserName.ShouldBe(null);
        actual.DatabaseUserPassword.ShouldBe(null);
        actual.HomebookConfigurationName.ShouldBe("");
        actual.HomebookUserName.ShouldBe("");
        actual.HomebookUserPassword.ShouldBe("");
        actual.HomebookAcceptLicenses.ShouldBeFalse();
    }

    [Test]
    public void HandleGetConfiguration_WithNoValues_Returns()
    {
        // Arrange
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_CONFIGURATION_NAME)
            .Returns((string?)null);

        // Act
        var result = SetupHandler.HandleGetConfiguration(_logger,
            _setupConfigurationProvider,
            CancellationToken.None);

        // Assert
        var ok = result.ShouldBeOfType<NotFound>();
        ok.ShouldNotBeNull();
    }

    [Test]
    public void HandleGetConfiguration_WithEmptyString_Returns()
    {
        // Arrange
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_CONFIGURATION_NAME)
            .Returns(string.Empty);

        // Act
        var result = SetupHandler.HandleGetConfiguration(_logger,
            _setupConfigurationProvider,
            CancellationToken.None);

        // Assert
        var ok = result.ShouldBeOfType<NotFound>();
        ok.ShouldNotBeNull();
    }

    [Test]
    public void HandleGetConfiguration_WithConfiguredValues_Returns()
    {
        // Arrange
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_CONFIGURATION_NAME)
            .Returns("test instance");

        // Act
        var result = SetupHandler.HandleGetConfiguration(_logger,
            _setupConfigurationProvider,
            CancellationToken.None);

        // Assert
        var ok = result.ShouldBeOfType<Ok>();
        ok.ShouldNotBeNull();
    }

    [Test]
    public void HandleGetConfiguration_WithThrowingException_Returns()
    {
        // Arrange
        _setupConfigurationProvider
            .GetValue(EnvironmentVariables.HOMEBOOK_CONFIGURATION_NAME)
            .Throws(new InvalidOperationException("boom"));

        // Act
        var result = SetupHandler.HandleGetConfiguration(_logger,
            _setupConfigurationProvider,
            CancellationToken.None);

        // Assert
        var ok = result.ShouldBeOfType<InternalServerError<string>>();
        ok.Value.ShouldBe("boom");
    }

    [Test]
    public async Task HandleStartSetup_WithFullRequest_Returns()
    {
        // Arrange
        var request = new StartSetupRequest(true,
            "POSTGRESQL",
            "192.168.0.1",
            5432,
            "homebook-test",
            "dbroot",
            "this-is-s3cr3t",
            "auser",
            "as3cr3tpassword",
            "Test Homebook",
            "EN");
        var setupConfigurationValidator = new SetupConfigurationValidator();
        var configuration = Substitute.For<IConfiguration, IConfigurationRoot>();

        var setupProcessor = Substitute.For<ISetupProcessor>();
        _setupProcessorFactory.Create().Returns(setupProcessor);

        // Act
        var result = await SetupHandler.HandleStartSetup(request,
            _logger,
            setupConfigurationValidator,
            _runtimeConfigurationProvider,
            _setupInstanceManager,
            _licenseProvider,
            _setupConfigurationProvider,
            configuration,
            _hostApplicationLifetime,
            _setupProcessorFactory,
            CancellationToken.None);

        // Assert
        var ok = result.ShouldBeOfType<Ok>();
        ok.ShouldNotBeNull();

        await _runtimeConfigurationProvider
            .Received(1)
            .UpdateConfigurationAsync("Database:Provider", "POSTGRESQL", Arg.Any<CancellationToken>());
        await _runtimeConfigurationProvider
            .Received(1)
            .UpdateConfigurationAsync("Database:Host", "192.168.0.1", Arg.Any<CancellationToken>());
        await _runtimeConfigurationProvider
            .Received(1)
            .UpdateConfigurationAsync("Database:Port", (ushort)5432, Arg.Any<CancellationToken>());
        await _runtimeConfigurationProvider
            .Received(1)
            .UpdateConfigurationAsync("Database:InstanceDbName", "homebook-test", Arg.Any<CancellationToken>());
        await _runtimeConfigurationProvider
            .Received(1)
            .UpdateConfigurationAsync("Database:Username", "dbroot", Arg.Any<CancellationToken>());
        await _runtimeConfigurationProvider
            .Received(1)
            .UpdateConfigurationAsync("Database:Password", "this-is-s3cr3t", Arg.Any<CancellationToken>());
        await setupProcessor
            .Received(1)
            .ProcessAsync(configuration,
                Arg.Is<SetupConfiguration>(u => u.DatabaseType == "POSTGRESQL"),
                Arg.Any<CancellationToken>());
        _hostApplicationLifetime
            .Received(1)
            .StopApplication();
    }

    [Test]
    public async Task HandleStartSetup_WithoutAcceptingLicenses_Returns()
    {
        // Arrange
        var request = new StartSetupRequest(false,
            "POSTGRESQL",
            "192.168.0.1",
            5432,
            "homebook-test",
            "dbroot",
            "this-is-s3cr3t",
            "auser",
            "as3cr3tpassword",
            "Test Homebook",
            "EN");
        var setupConfigurationValidator = new SetupConfigurationValidator();
        var configuration = Substitute.For<IConfiguration, IConfigurationRoot>();

        var setupProcessor = Substitute.For<ISetupProcessor>();
        _setupProcessorFactory.Create().Returns(setupProcessor);

        // Act
        var result = await SetupHandler.HandleStartSetup(request,
            _logger,
            setupConfigurationValidator,
            _runtimeConfigurationProvider,
            _setupInstanceManager,
            _licenseProvider,
            _setupConfigurationProvider,
            configuration,
            _hostApplicationLifetime,
            _setupProcessorFactory,
            CancellationToken.None);

        // Assert
        var internalErr = result.ShouldBeOfType<StatusCodeHttpResult>();
        internalErr.StatusCode.ShouldBe(422); // Service Unavailable
        internalErr.ShouldNotBeNull();
    }

    [Test]
    public async Task HandleStartSetup_WithInvalidRequestData_Returns()
    {
        // Arrange
        var request = new StartSetupRequest(false,
            "",
            "",
            0,
            "",
            "",
            "",
            "",
            "",
            "",
            "");
        var setupConfigurationValidator = new SetupConfigurationValidator();
        var configuration = Substitute.For<IConfiguration, IConfigurationRoot>();

        var setupProcessor = Substitute.For<ISetupProcessor>();
        _setupProcessorFactory.Create().Returns(setupProcessor);

        // Act
        var result = await SetupHandler.HandleStartSetup(request,
            _logger,
            setupConfigurationValidator,
            _runtimeConfigurationProvider,
            _setupInstanceManager,
            _licenseProvider,
            _setupConfigurationProvider,
            configuration,
            _hostApplicationLifetime,
            _setupProcessorFactory,
            CancellationToken.None);

        // Assert
        var response = result.ShouldBeOfType<BadRequest<string[]>>();
        response.ShouldNotBeNull();
    }

    [Test]
    public async Task HandleStartSetup_WithThrowingSetupException_Returns()
    {
        // Arrange
        var request = new StartSetupRequest(true,
            "POSTGRESQL",
            "192.168.0.1",
            5432,
            "homebook-test",
            "dbroot",
            "this-is-s3cr3t",
            "auser",
            "as3cr3tpassword",
            "Test Homebook",
            "EN");
        var setupConfigurationValidator = new SetupConfigurationValidator();
        var configuration = Substitute.For<IConfiguration, IConfigurationRoot>();

        var setupProcessor = Substitute.For<ISetupProcessor>();
        _setupProcessorFactory.Create().Returns(setupProcessor);

        setupProcessor.ProcessAsync(configuration,
                Arg.Any<SetupConfiguration>(),
                Arg.Any<CancellationToken>())
            .Throws(new SetupException("boom"));

        // Act
        var result = await SetupHandler.HandleStartSetup(request,
            _logger,
            setupConfigurationValidator,
            _runtimeConfigurationProvider,
            _setupInstanceManager,
            _licenseProvider,
            _setupConfigurationProvider,
            configuration,
            _hostApplicationLifetime,
            _setupProcessorFactory,
            CancellationToken.None);

        // Assert
        var response = result.ShouldBeOfType<BadRequest<string>>();
        response.ShouldNotBeNull();
        response.Value?.ShouldContain("boom");
    }

    [Test]
    public async Task HandleStartSetup_WithThrowingUnknownException_Returns()
    {
        // Arrange
        var request = new StartSetupRequest(true,
            "POSTGRESQL",
            "192.168.0.1",
            5432,
            "homebook-test",
            "dbroot",
            "this-is-s3cr3t",
            "auser",
            "as3cr3tpassword",
            "Test Homebook",
            "EN");
        var setupConfigurationValidator = new SetupConfigurationValidator();
        var configuration = Substitute.For<IConfiguration, IConfigurationRoot>();

        var setupProcessor = Substitute.For<ISetupProcessor>();
        _setupProcessorFactory.Create().Returns(setupProcessor);

        setupProcessor.ProcessAsync(configuration,
                Arg.Any<SetupConfiguration>(),
                Arg.Any<CancellationToken>())
            .Throws(new InvalidOperationException("boom"));

        // Act
        var result = await SetupHandler.HandleStartSetup(request,
            _logger,
            setupConfigurationValidator,
            _runtimeConfigurationProvider,
            _setupInstanceManager,
            _licenseProvider,
            _setupConfigurationProvider,
            configuration,
            _hostApplicationLifetime,
            _setupProcessorFactory,
            CancellationToken.None);

        // Assert
        var response = result.ShouldBeOfType<InternalServerError<string>>();
        response.ShouldNotBeNull();
        response.Value?.ShouldContain("boom");
    }
}
