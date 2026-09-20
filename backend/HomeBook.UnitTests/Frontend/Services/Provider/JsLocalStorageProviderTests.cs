using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Services.Provider;
using Microsoft.JSInterop;
using Microsoft.JSInterop.Infrastructure;
using NSubstitute;

namespace HomeBook.UnitTests.Frontend.Services.Provider;

[TestFixture]
public class JsLocalStorageProviderTests
{
    private IJSRuntime _mockJsRuntime;
    private IJsLocalStorageProvider _localStorageProvider;

    [SetUp]
    public void SetUp()
    {
        _mockJsRuntime = Substitute.For<IJSRuntime>();
        _localStorageProvider = new JsLocalStorageProvider(_mockJsRuntime);
    }

    [Test]
    public async Task SetItemAsync_WithValidKeyAndValue_ShouldCallJSRuntime()
    {
        // Arrange
        const string key = "test-key";
        const string value = "test-value";

        // Act
        await _localStorageProvider.SetItemAsync(key, value);

        // Assert
        await _mockJsRuntime.Received(1).InvokeAsync<IJSVoidResult>(
            "localStorage.setItem",
            Arg.Any<CancellationToken>(),
            Arg.Is<object[]>(args => args.Length == 2 && args[0].Equals(key) && args[1].Equals(value)));
    }

    [Test]
    public void SetItemAsync_WithNullKey_ShouldThrowArgumentException()
    {
        // Act & Assert
        Should.ThrowAsync<ArgumentException>(() =>
            _localStorageProvider.SetItemAsync(null!, "value"));
    }

    [Test]
    public void SetItemAsync_WithEmptyKey_ShouldThrowArgumentException()
    {
        // Act & Assert
        Should.ThrowAsync<ArgumentException>(() =>
            _localStorageProvider.SetItemAsync(string.Empty, "value"));
    }

    [Test]
    public void SetItemAsync_WithNullValue_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        Should.ThrowAsync<ArgumentNullException>(() =>
            _localStorageProvider.SetItemAsync("key", null!));
    }

    [Test]
    public async Task GetItemAsync_WithValidKey_ShouldReturnValue()
    {
        // Arrange
        const string key = "test-key";
        const string expectedValue = "test-value";

        _mockJsRuntime.InvokeAsync<string?>(
                "localStorage.getItem",
                Arg.Any<CancellationToken>(),
                Arg.Is<object[]>(args => args.Length == 1 && args[0].Equals(key)))
            .Returns(expectedValue);

        // Act
        string? result = await _localStorageProvider.GetItemAsync(key);

        // Assert
        result.ShouldBe(expectedValue);
    }

    [Test]
    public async Task GetItemAsync_WithNonExistentKey_ShouldReturnNull()
    {
        // Arrange
        const string key = "non-existent-key";

        _mockJsRuntime.InvokeAsync<string?>(
                "localStorage.getItem",
                Arg.Any<CancellationToken>(),
                Arg.Is<object[]>(args => args.Length == 1 && args[0].Equals(key)))
            .Returns((string?)null);

        // Act
        string? result = await _localStorageProvider.GetItemAsync(key);

        // Assert
        result.ShouldBeNull();
    }

    [Test]
    public void GetItemAsync_WithNullKey_ShouldThrowArgumentException()
    {
        // Act & Assert
        Should.ThrowAsync<ArgumentException>(() =>
            _localStorageProvider.GetItemAsync(null!));
    }

    [Test]
    public async Task RemoveItemAsync_WithValidKey_ShouldCallJSRuntime()
    {
        // Arrange
        const string key = "test-key";

        // Act
        await _localStorageProvider.RemoveItemAsync(key);

        // Assert
        await _mockJsRuntime.Received(1).InvokeAsync<IJSVoidResult>(
            "localStorage.removeItem",
            Arg.Any<CancellationToken>(),
            Arg.Is<object[]>(args => args.Length == 1 && args[0].Equals(key)));
    }

    [Test]
    public void RemoveItemAsync_WithNullKey_ShouldThrowArgumentException()
    {
        // Act & Assert
        Should.ThrowAsync<ArgumentException>(() =>
            _localStorageProvider.RemoveItemAsync(null!));
    }

    [Test]
    public async Task ClearAsync_ShouldCallJSRuntime()
    {
        // Act
        await _localStorageProvider.ClearAsync();

        // Assert
        await _mockJsRuntime.Received(1).InvokeAsync<IJSVoidResult>(
            "localStorage.clear",
            Arg.Any<CancellationToken>(),
            Arg.Is<object[]>(args => args.Length == 0));
    }

    [Test]
    public async Task GetLengthAsync_ShouldReturnLength()
    {
        // Arrange
        const int expectedLength = 5;

        _mockJsRuntime.InvokeAsync<int>(
                "localStorage.length",
                Arg.Any<CancellationToken>(),
                Arg.Is<object[]>(args => args.Length == 0))
            .Returns(expectedLength);

        // Act
        int result = await _localStorageProvider.GetLengthAsync();

        // Assert
        result.ShouldBe(expectedLength);
    }

    [Test]
    public async Task GetKeyAsync_WithValidIndex_ShouldReturnKey()
    {
        // Arrange
        const int index = 0;
        const string expectedKey = "test-key";

        _mockJsRuntime.InvokeAsync<string?>(
                "localStorage.key",
                Arg.Any<CancellationToken>(),
                Arg.Is<object[]>(args => args.Length == 1 && args[0].Equals(index)))
            .Returns(expectedKey);

        // Act
        string? result = await _localStorageProvider.GetKeyAsync(index);

        // Assert
        result.ShouldBe(expectedKey);
    }

    [Test]
    public void GetKeyAsync_WithNegativeIndex_ShouldThrowArgumentOutOfRangeException()
    {
        // Act & Assert
        Should.ThrowAsync<ArgumentOutOfRangeException>(() =>
            _localStorageProvider.GetKeyAsync(-1));
    }

    [Test]
    public async Task ContainsKeyAsync_WithExistingKey_ShouldReturnTrue()
    {
        // Arrange
        const string key = "existing-key";
        const string value = "some-value";

        _mockJsRuntime.InvokeAsync<string?>(
                "localStorage.getItem",
                Arg.Any<CancellationToken>(),
                Arg.Is<object[]>(args => args.Length == 1 && args[0].Equals(key)))
            .Returns(value);

        // Act
        bool result = await _localStorageProvider.ContainsKeyAsync(key);

        // Assert
        result.ShouldBeTrue();
    }

    [Test]
    public async Task ContainsKeyAsync_WithNonExistingKey_ShouldReturnFalse()
    {
        // Arrange
        const string key = "non-existing-key";

        _mockJsRuntime.InvokeAsync<string?>(
                "localStorage.getItem",
                Arg.Any<CancellationToken>(),
                Arg.Is<object[]>(args => args.Length == 1 && args[0].Equals(key)))
            .Returns((string?)null);

        // Act
        bool result = await _localStorageProvider.ContainsKeyAsync(key);

        // Assert
        result.ShouldBeFalse();
    }

    [Test]
    public void ContainsKeyAsync_WithNullKey_ShouldThrowArgumentException()
    {
        // Act & Assert
        Should.ThrowAsync<ArgumentException>(() =>
            _localStorageProvider.ContainsKeyAsync(null!));
    }
}
