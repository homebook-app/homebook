using HomeBook.Backend.Abstractions.Contracts;
using HomeBook.Backend.Abstractions.Models;
using HomeBook.Backend.Core.Account;
using HomeBook.Backend.Data.Contracts;
using HomeBook.Backend.Data.Entities;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace HomeBook.UnitTests.Backend.Core.Account;

[TestFixture]
public class AccountProviderTests
{
    private IUserRepository _userRepository = null!;
    private IHashProviderFactory _hashProviderFactory = null!;
    private IJwtService _jwtService = null!;
    private ILogger<AccountProvider> _logger = null!;
    private IHashProvider _hashProvider = null!;
    private AccountProvider _accountProvider = null!;

    [SetUp]
    public void SetUp()
    {
        _userRepository = Substitute.For<IUserRepository>();
        _hashProviderFactory = Substitute.For<IHashProviderFactory>();
        _jwtService = Substitute.For<IJwtService>();
        _logger = Substitute.For<ILogger<AccountProvider>>();
        _hashProvider = Substitute.For<IHashProvider>();

        _accountProvider = new AccountProvider(
            _userRepository,
            _hashProviderFactory,
            _jwtService,
            _logger);
    }

    [Test]
    public async Task LoginAsync_ValidCredentials_ReturnsTokenResult()
    {
        // Arrange
        var username = "testuser";
        var password = "testpassword";
        var userId = Guid.NewGuid();
        var isAdmin = false;
        var user = new User
        {
            Id = userId,
            Username = username,
            PasswordHash = "hashedpassword",
            PasswordHashType = "ARGON2ID",
            Disabled = null
        };

        var expectedToken = new JwtTokenResult
        {
            Token = "jwt-token",
            RefreshToken = "refresh-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            UserId = userId,
            Username = username
        };

        _userRepository.GetUserByUsernameAsync(username, Arg.Any<CancellationToken>())
            .Returns(user);
        _hashProviderFactory.IsSupported("ARGON2ID").Returns(true);
        _hashProviderFactory.Create("ARGON2ID").Returns(_hashProvider);
        _hashProvider.Verify(password, "hashedpassword").Returns(true);
        _jwtService.GenerateToken(userId, username, isAdmin).Returns(expectedToken);

        // Act
        var result = await _accountProvider.LoginAsync(username, password);

        // Assert
        result.ShouldNotBeNull();
        result.ShouldBe(expectedToken);

        await _userRepository.Received(1).GetUserByUsernameAsync(username, Arg.Any<CancellationToken>());
        _hashProviderFactory.Received(1).IsSupported("ARGON2ID");
        _hashProviderFactory.Received(1).Create("ARGON2ID");
        _hashProvider.Received(1).Verify(password, "hashedpassword");
        _jwtService.Received(1).GenerateToken(userId, username, isAdmin);
    }

    [Test]
    public async Task LoginAsync_UserNotFound_ReturnsNull()
    {
        // Arrange
        var username = "nonexistent";
        var password = "password";

        _userRepository.GetUserByUsernameAsync(username, Arg.Any<CancellationToken>())
            .Returns((User?)null);

        // Act
        var result = await _accountProvider.LoginAsync(username, password);

        // Assert
        result.ShouldBeNull();

        await _userRepository.Received(1).GetUserByUsernameAsync(username, Arg.Any<CancellationToken>());
        _hashProviderFactory.DidNotReceive().IsSupported(Arg.Any<string>());
        _jwtService.DidNotReceive().GenerateToken(Arg.Any<Guid>(), Arg.Any<string>());
    }

    [Test]
    public async Task LoginAsync_UserDisabled_ReturnsNull()
    {
        // Arrange
        var username = "disableduser";
        var password = "password";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            PasswordHash = "hashedpassword",
            PasswordHashType = "ARGON2ID",
            Disabled = DateTime.UtcNow.AddDays(-1)
        };

        _userRepository.GetUserByUsernameAsync(username, Arg.Any<CancellationToken>())
            .Returns(user);

        // Act
        var result = await _accountProvider.LoginAsync(username, password);

        // Assert
        result.ShouldBeNull();

        await _userRepository.Received(1).GetUserByUsernameAsync(username, Arg.Any<CancellationToken>());
        _hashProviderFactory.DidNotReceive().IsSupported(Arg.Any<string>());
        _jwtService.DidNotReceive().GenerateToken(Arg.Any<Guid>(), Arg.Any<string>());
    }

    [Test]
    public async Task LoginAsync_UnsupportedHashType_ReturnsNull()
    {
        // Arrange
        var username = "testuser";
        var password = "password";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            PasswordHash = "hashedpassword",
            PasswordHashType = "UNSUPPORTED",
            Disabled = null
        };

        _userRepository.GetUserByUsernameAsync(username, Arg.Any<CancellationToken>())
            .Returns(user);
        _hashProviderFactory.IsSupported("UNSUPPORTED").Returns(false);

        // Act
        var result = await _accountProvider.LoginAsync(username, password);

        // Assert
        result.ShouldBeNull();

        await _userRepository.Received(1).GetUserByUsernameAsync(username, Arg.Any<CancellationToken>());
        _hashProviderFactory.Received(1).IsSupported("UNSUPPORTED");
        _hashProviderFactory.DidNotReceive().Create(Arg.Any<string>());
        _jwtService.DidNotReceive().GenerateToken(Arg.Any<Guid>(), Arg.Any<string>());
    }

    [Test]
    public async Task LoginAsync_InvalidPassword_ReturnsNull()
    {
        // Arrange
        var username = "testuser";
        var password = "wrongpassword";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            PasswordHash = "hashedpassword",
            PasswordHashType = "ARGON2ID",
            Disabled = null
        };

        _userRepository.GetUserByUsernameAsync(username, Arg.Any<CancellationToken>())
            .Returns(user);
        _hashProviderFactory.IsSupported("ARGON2ID").Returns(true);
        _hashProviderFactory.Create("ARGON2ID").Returns(_hashProvider);
        _hashProvider.Verify(password, "hashedpassword").Returns(false);

        // Act
        var result = await _accountProvider.LoginAsync(username, password);

        // Assert
        result.ShouldBeNull();

        await _userRepository.Received(1).GetUserByUsernameAsync(username, Arg.Any<CancellationToken>());
        _hashProviderFactory.Received(1).IsSupported("ARGON2ID");
        _hashProviderFactory.Received(1).Create("ARGON2ID");
        _hashProvider.Received(1).Verify(password, "hashedpassword");
        _jwtService.DidNotReceive().GenerateToken(Arg.Any<Guid>(), Arg.Any<string>());
    }

    [Test]
    public async Task LoginAsync_ExceptionThrown_ReturnsNull()
    {
        // Arrange
        var username = "testuser";
        var password = "password";
        var exception = new Exception("Database error");

        _userRepository.GetUserByUsernameAsync(username, Arg.Any<CancellationToken>())
            .Throws(exception);

        // Act
        var result = await _accountProvider.LoginAsync(username, password);

        // Assert
        result.ShouldBeNull();

        await _userRepository.Received(1).GetUserByUsernameAsync(username, Arg.Any<CancellationToken>());
        _jwtService.DidNotReceive().GenerateToken(Arg.Any<Guid>(), Arg.Any<string>());
    }

    [Test]
    public async Task LogoutAsync_ValidToken_ReturnsTrue()
    {
        // Arrange
        var token = "valid-jwt-token";

        _jwtService.ValidateToken(token).Returns(true);

        // Act
        var result = await _accountProvider.LogoutAsync(token);

        // Assert
        result.ShouldBeTrue();

        _jwtService.Received(1).ValidateToken(token);
    }

    [Test]
    public async Task LogoutAsync_InvalidToken_ReturnsFalse()
    {
        // Arrange
        var token = "invalid-jwt-token";

        _jwtService.ValidateToken(token).Returns(false);

        // Act
        var result = await _accountProvider.LogoutAsync(token);

        // Assert
        result.ShouldBeFalse();

        _jwtService.Received(1).ValidateToken(token);
    }

    [Test]
    public async Task LogoutAsync_ExceptionThrown_ReturnsFalse()
    {
        // Arrange
        var token = "jwt-token";
        var exception = new Exception("Token validation error");

        _jwtService.ValidateToken(token).Throws(exception);

        // Act
        var result = await _accountProvider.LogoutAsync(token);

        // Assert
        result.ShouldBeFalse();

        _jwtService.Received(1).ValidateToken(token);
    }

    [Test]
    public void LoginAsync_NullUserRepository_ThrowsArgumentNullException()
    {
        // Act & Assert
        var act = async () => await _accountProvider.LoginAsync("user", "pass");
        act.ShouldThrowAsync<ArgumentNullException>();
    }

    [Test]
    public void LogoutAsync_NullJwtService_ThrowsArgumentNullException()
    {
        // Act & Assert
        var act = async () => await _accountProvider.LogoutAsync("token");
        act.ShouldThrowAsync<ArgumentNullException>();
    }
}
