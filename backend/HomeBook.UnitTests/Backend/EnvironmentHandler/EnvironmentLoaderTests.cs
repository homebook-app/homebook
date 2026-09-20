using HomeBook.Backend.EnvironmentHandler;

namespace HomeBook.UnitTests.Backend.EnvironmentHandler;

[TestFixture]
public class EnvironmentLoaderTests
{
    private string _testFilePath;
    private List<string> _originalEnvVars;

    [SetUp]
    public void SetUp()
    {
        _testFilePath = Path.GetTempFileName();
        _originalEnvVars = new List<string>();
    }

    [TearDown]
    public void TearDown()
    {
        // Clean up test file
        if (File.Exists(_testFilePath))
            File.Delete(_testFilePath);

        // Restore original environment variables
        foreach (string envVar in _originalEnvVars)
        {
            Environment.SetEnvironmentVariable(envVar, null);
        }
    }

    [Test]
    public void LoadEnvFile_WithNonExistentFile_ShouldNotThrow()
    {
        // Arrange
        string nonExistentFile = "non-existent-file.env";

        // Act & Assert
        Should.NotThrow(() => EnvironmentLoader.LoadEnvFile(nonExistentFile));
    }

    [Test]
    public void LoadEnvFile_WithValidKeyValuePairs_ShouldSetEnvironmentVariables()
    {
        // Arrange
        string content = """
                         TEST_KEY1=value1
                         TEST_KEY2=value2
                         TEST_KEY3=value with spaces
                         """;
        File.WriteAllText(_testFilePath, content);
        TrackEnvVar("TEST_KEY1");
        TrackEnvVar("TEST_KEY2");
        TrackEnvVar("TEST_KEY3");

        // Act
        EnvironmentLoader.LoadEnvFile(_testFilePath);

        // Assert
        Environment.GetEnvironmentVariable("TEST_KEY1").ShouldBe("value1");
        Environment.GetEnvironmentVariable("TEST_KEY2").ShouldBe("value2");
        Environment.GetEnvironmentVariable("TEST_KEY3").ShouldBe("value with spaces");
    }

    [Test]
    public void LoadEnvFile_WithCommentsAndEmptyLines_ShouldIgnoreThem()
    {
        // Arrange
        string content = """
                         # This is a comment
                         TEST_KEY=value

                         # Another comment
                             # Indented comment
                         TEST_KEY2=value2
                         """;
        File.WriteAllText(_testFilePath, content);
        TrackEnvVar("TEST_KEY");
        TrackEnvVar("TEST_KEY2");

        // Act
        EnvironmentLoader.LoadEnvFile(_testFilePath);

        // Assert
        Environment.GetEnvironmentVariable("TEST_KEY").ShouldBe("value");
        Environment.GetEnvironmentVariable("TEST_KEY2").ShouldBe("value2");
    }

    [Test]
    public void LoadEnvFile_WithWhitespaceAroundKeyValue_ShouldTrimCorrectly()
    {
        // Arrange
        string content = """
                           TEST_KEY1  =  value1
                         	TEST_KEY2	=	value2
                            TEST_KEY3 = value with spaces
                         """;
        File.WriteAllText(_testFilePath, content);
        TrackEnvVar("TEST_KEY1");
        TrackEnvVar("TEST_KEY2");
        TrackEnvVar("TEST_KEY3");

        // Act
        EnvironmentLoader.LoadEnvFile(_testFilePath);

        // Assert
        Environment.GetEnvironmentVariable("TEST_KEY1").ShouldBe("value1");
        Environment.GetEnvironmentVariable("TEST_KEY2").ShouldBe("value2");
        Environment.GetEnvironmentVariable("TEST_KEY3").ShouldBe("value with spaces");
    }

    [Test]
    public void LoadEnvFile_WithInvalidLines_ShouldIgnoreThem()
    {
        // Arrange
        string content = """
                         VALID_KEY=value
                         invalid_line_without_equals
                         =value_without_key
                         ANOTHER_VALID=value2
                         """;
        File.WriteAllText(_testFilePath, content);
        TrackEnvVar("VALID_KEY");
        TrackEnvVar("ANOTHER_VALID");

        // Act
        EnvironmentLoader.LoadEnvFile(_testFilePath);

        // Assert
        Environment.GetEnvironmentVariable("VALID_KEY").ShouldBe("value");
        Environment.GetEnvironmentVariable("ANOTHER_VALID").ShouldBe("value2");
    }

    [Test]
    public void LoadEnvFile_WithEmptyKey_ShouldIgnoreLine()
    {
        // Arrange
        string content = """
                         =somevalue
                           =anothervalue
                         VALID_KEY=value
                         """;
        File.WriteAllText(_testFilePath, content);
        TrackEnvVar("VALID_KEY");

        // Act
        EnvironmentLoader.LoadEnvFile(_testFilePath);

        // Assert
        Environment.GetEnvironmentVariable("VALID_KEY").ShouldBe("value");
    }

    [Test]
    public void LoadEnvFile_WithEmptyValue_ShouldSetEmptyString()
    {
        // Arrange
        string content = """
                         TEST_KEY=
                         TEST_KEY2=
                         """;
        File.WriteAllText(_testFilePath, content);
        TrackEnvVar("TEST_KEY");
        TrackEnvVar("TEST_KEY2");

        // Act
        EnvironmentLoader.LoadEnvFile(_testFilePath);

        // Assert
        Environment.GetEnvironmentVariable("TEST_KEY").ShouldBe("");
        Environment.GetEnvironmentVariable("TEST_KEY2").ShouldBe("");
    }

    [Test]
    public void LoadEnvFile_WithSpecialCharactersInValue_ShouldPreserveThem()
    {
        // Arrange
        string content = """
                         TEST_KEY1=value with symbols !@#$%^&*()
                         TEST_KEY2=path/to/file.txt
                         TEST_KEY3=https://example.com:8080/path?param=value
                         """;
        File.WriteAllText(_testFilePath, content);
        TrackEnvVar("TEST_KEY1");
        TrackEnvVar("TEST_KEY2");
        TrackEnvVar("TEST_KEY3");

        // Act
        EnvironmentLoader.LoadEnvFile(_testFilePath);

        // Assert
        Environment.GetEnvironmentVariable("TEST_KEY1").ShouldBe("value with symbols !@#$%^&*()");
        Environment.GetEnvironmentVariable("TEST_KEY2").ShouldBe("path/to/file.txt");
        Environment.GetEnvironmentVariable("TEST_KEY3").ShouldBe("https://example.com:8080/path?param=value");
    }

    [Test]
    public void LoadEnvFile_WithMultipleEqualsInValue_ShouldPreserveValue()
    {
        // Arrange
        string content = """
                         TEST_KEY=value=with=equals=signs
                         DATABASE_URL=postgresql://user:pass=word@localhost:5432/db
                         """;
        File.WriteAllText(_testFilePath, content);
        TrackEnvVar("TEST_KEY");
        TrackEnvVar("DATABASE_URL");

        // Act
        EnvironmentLoader.LoadEnvFile(_testFilePath);

        // Assert
        Environment.GetEnvironmentVariable("TEST_KEY").ShouldBe("value=with=equals=signs");
        Environment.GetEnvironmentVariable("DATABASE_URL").ShouldBe("postgresql://user:pass=word@localhost:5432/db");
    }

    [Test]
    public void LoadEnvFile_WithOnlyWhitespaceLines_ShouldIgnoreThem()
    {
        // Arrange
        string content = """
                         TEST_KEY=value


                         TEST_KEY2=value2
                         """;
        File.WriteAllText(_testFilePath, content);
        TrackEnvVar("TEST_KEY");
        TrackEnvVar("TEST_KEY2");

        // Act
        EnvironmentLoader.LoadEnvFile(_testFilePath);

        // Assert
        Environment.GetEnvironmentVariable("TEST_KEY").ShouldBe("value");
        Environment.GetEnvironmentVariable("TEST_KEY2").ShouldBe("value2");
    }

    [Test]
    public void LoadEnvFile_WithEmptyFile_ShouldNotThrow()
    {
        // Arrange
        File.WriteAllText(_testFilePath, "");

        // Act & Assert
        Should.NotThrow(() => EnvironmentLoader.LoadEnvFile(_testFilePath));
    }

    private void TrackEnvVar(string key)
    {
        _originalEnvVars.Add(key);
    }
}
