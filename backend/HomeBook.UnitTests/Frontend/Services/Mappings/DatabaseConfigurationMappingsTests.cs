using HomeBook.Client.Models;
using HomeBook.Frontend.Services.Mappings;

namespace HomeBook.UnitTests.Frontend.Services.Mappings;

[TestFixture]
public class DatabaseConfigurationMappingsTests
{
    [Test]
    public void ToDatabaseConfiguration_WithValidResponse_ShouldMapCorrectly()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = "localhost",
            DatabasePort = "5432",
            DatabaseName = "testdb",
            DatabaseUserName = "testuser",
            DatabaseUserPassword = "testpass"
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.Host.ShouldBe("localhost");
        result.Port.ShouldBe((ushort)5432);
        result.DatabaseName.ShouldBe("testdb");
        result.Username.ShouldBe("testuser");
        result.Password.ShouldBe("testpass");
    }

    [Test]
    public void ToDatabaseConfiguration_WithNullDatabaseHost_ShouldMapToEmptyString()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = null,
            DatabasePort = "5432",
            DatabaseName = "testdb",
            DatabaseUserName = "testuser",
            DatabaseUserPassword = "testpass"
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.Host.ShouldBe(string.Empty);
    }

    [Test]
    public void ToDatabaseConfiguration_WithNullDatabaseName_ShouldMapToEmptyString()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = "localhost",
            DatabasePort = "5432",
            DatabaseName = null,
            DatabaseUserName = "testuser",
            DatabaseUserPassword = "testpass"
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.DatabaseName.ShouldBe(string.Empty);
    }

    [Test]
    public void ToDatabaseConfiguration_WithNullDatabaseUserName_ShouldMapToEmptyString()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = "localhost",
            DatabasePort = "5432",
            DatabaseName = "testdb",
            DatabaseUserName = null,
            DatabaseUserPassword = "testpass"
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.Username.ShouldBe(string.Empty);
    }

    [Test]
    public void ToDatabaseConfiguration_WithNullDatabaseUserPassword_ShouldMapToEmptyString()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = "localhost",
            DatabasePort = "5432",
            DatabaseName = "testdb",
            DatabaseUserName = "testuser",
            DatabaseUserPassword = null
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.Password.ShouldBe(string.Empty);
    }

    [Test]
    public void ToDatabaseConfiguration_WithValidPortString_ShouldParseToUShort()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = "localhost",
            DatabasePort = "3306",
            DatabaseName = "testdb",
            DatabaseUserName = "testuser",
            DatabaseUserPassword = "testpass"
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.Port.ShouldBe((ushort)3306);
    }

    [Test]
    public void ToDatabaseConfiguration_WithInvalidPortString_ShouldMapToZero()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = "localhost",
            DatabasePort = "invalid",
            DatabaseName = "testdb",
            DatabaseUserName = "testuser",
            DatabaseUserPassword = "testpass"
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.Port.ShouldBe((ushort)0);
    }

    [Test]
    public void ToDatabaseConfiguration_WithNullPortString_ShouldMapToZero()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = "localhost",
            DatabasePort = null,
            DatabaseName = "testdb",
            DatabaseUserName = "testuser",
            DatabaseUserPassword = "testpass"
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.Port.ShouldBe((ushort)0);
    }

    [Test]
    public void ToDatabaseConfiguration_WithEmptyPortString_ShouldMapToZero()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = "localhost",
            DatabasePort = "",
            DatabaseName = "testdb",
            DatabaseUserName = "testuser",
            DatabaseUserPassword = "testpass"
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.Port.ShouldBe((ushort)0);
    }

    [Test]
    public void ToDatabaseConfiguration_WithPortOutOfUShortRange_ShouldMapToZero()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = "localhost",
            DatabasePort = "99999", // > ushort.MaxValue (65535)
            DatabaseName = "testdb",
            DatabaseUserName = "testuser",
            DatabaseUserPassword = "testpass"
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.Port.ShouldBe((ushort)0);
    }

    [Test]
    public void ToDatabaseConfiguration_WithAllNullValues_ShouldMapToEmptyStringsAndZeroPort()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = null,
            DatabasePort = null,
            DatabaseName = null,
            DatabaseUserName = null,
            DatabaseUserPassword = null
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.Host.ShouldBe(string.Empty);
        result.Port.ShouldBe((ushort)0);
        result.DatabaseName.ShouldBe(string.Empty);
        result.Username.ShouldBe(string.Empty);
        result.Password.ShouldBe(string.Empty);
    }

    [Test]
    public void ToDatabaseConfiguration_WithWhitespacePortString_ShouldMapToZero()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = "localhost",
            DatabasePort = "   ",
            DatabaseName = "testdb",
            DatabaseUserName = "testuser",
            DatabaseUserPassword = "testpass"
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.Port.ShouldBe((ushort)0);
    }

    [Test]
    public void ToDatabaseConfiguration_WithMaxValidPort_ShouldMapCorrectly()
    {
        // Arrange
        var response = new GetDatabaseCheckResponse
        {
            DatabaseHost = "localhost",
            DatabasePort = "65535", // ushort.MaxValue
            DatabaseName = "testdb",
            DatabaseUserName = "testuser",
            DatabaseUserPassword = "testpass"
        };

        // Act
        var result = response.ToDatabaseConfiguration();

        // Assert
        result.Port.ShouldBe((ushort)65535);
    }
}
