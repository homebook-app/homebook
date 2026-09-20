using System.Net;
using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Services.Exceptions;
using HomeBook.Frontend.Services.Provider;

namespace HomeBook.UnitTests.Frontend.Services.Provider;

[TestFixture]
public class ContentProviderTests
{
    private TestHttpMessageHandler _testHandler;
    private HttpClient _httpClient;
    private IContentProvider _contentProvider;

    [SetUp]
    public void SetUp()
    {
        _testHandler = new TestHttpMessageHandler();
        _httpClient = new HttpClient(_testHandler)
        {
            BaseAddress = new Uri("https://test.example.com/")
        };
        _contentProvider = new ContentProvider(_httpClient);
    }

    [TearDown]
    public void TearDown()
    {
        _httpClient.Dispose();
        _testHandler.Dispose();
    }

    [Test]
    public async Task GetContentAsync_WhenFileExists_ShouldReturnContent()
    {
        // Arrange
        const string fileName = "test-file.txt";
        const string expectedContent = "This is test content";

        _testHandler.SetResponse(HttpStatusCode.OK, expectedContent);

        // Act
        string result = await _contentProvider.GetContentAsync(fileName);

        // Assert
        result.ShouldBe(expectedContent);
    }

    [Test]
    public async Task GetContentAsync_WhenFileNotFound_ShouldThrowHttpNotFoundException()
    {
        // Arrange
        const string fileName = "non-existent-file.txt";

        _testHandler.SetResponse(HttpStatusCode.NotFound, string.Empty);

        // Act & Assert
        HttpNotFoundException exception = await Should.ThrowAsync<HttpNotFoundException>(
            () => _contentProvider.GetContentAsync(fileName));

        exception.Url.ShouldBe(fileName);
        exception.Message.ShouldBe("response is not found.");
    }

    [Test]
    public async Task GetContentAsync_WhenFileIsEmpty_ShouldReturnEmptyString()
    {
        // Arrange
        const string fileName = "empty-file.txt";

        _testHandler.SetResponse(HttpStatusCode.OK, string.Empty);

        // Act
        string result = await _contentProvider.GetContentAsync(fileName);

        // Assert
        result.ShouldBe(string.Empty);
        result.ShouldBeEmpty();
    }

    [Test]
    public async Task GetContentAsync_WithLongContent_ShouldReturnFullContent()
    {
        // Arrange
        const string fileName = "large-file.txt";
        string expectedContent = new string('X', 10000);

        _testHandler.SetResponse(HttpStatusCode.OK, expectedContent);

        // Act
        string result = await _contentProvider.GetContentAsync(fileName);

        // Assert
        result.ShouldBe(expectedContent);
        result.Length.ShouldBe(10000);
    }
}

// Test helper class for HttpClient testing without external mocking frameworks
public class TestHttpMessageHandler : HttpMessageHandler
{
    private HttpStatusCode _statusCode = HttpStatusCode.OK;
    private string _content = string.Empty;

    public void SetResponse(HttpStatusCode statusCode, string content)
    {
        _statusCode = statusCode;
        _content = content;
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        if (_statusCode == HttpStatusCode.NotFound)
        {
            throw new HttpRequestException("Not Found", null, HttpStatusCode.NotFound);
        }

        HttpResponseMessage response = new HttpResponseMessage(_statusCode)
        {
            Content = new StringContent(_content)
        };

        return Task.FromResult(response);
    }
}
