using HomeBook.Frontend.Services.Extensions;
using HomeBook.Frontend.Services.Mappings;

namespace HomeBook.UnitTests.Frontend.Services.Extensions;

[TestFixture]
public class StringExtensionsTests
{
    [Test]
    public void ToCssClass_WithValidString_Returns()
    {
        // Arrange
        var input = "TestStringForCssClass";
        var expected = "test-string-for-css-class";

        // Act
        var result = input.ToCssClass();

        // Assert
        result.ShouldBe(expected);
    }

    [Test]
    public void ToCssClass_WithNullString_Returns()
    {
        // Arrange
        var input = (string)null!;
        var expected = string.Empty;

        // Act
        var result = input.ToCssClass();

        // Assert
        result.ShouldBe(expected);
    }

    [Test]
    public void ToCssClass_WithEmptyString_Returns()
    {
        // Arrange
        var input = string.Empty;
        var expected = string.Empty;

        // Act
        var result = input.ToCssClass();

        // Assert
        result.ShouldBe(expected);
    }
}
