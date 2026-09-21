using HomeBook.Backend.Handler;
using HomeBook.Backend.Responses;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NUnit.Framework;
using Shouldly;

namespace HomeBook.UnitTests.Backend.Handler;

[TestFixture]
public class PlatformHandlerTests
{
    [Test]
    public void HandleGetLocales_ShouldReturnAllTranslatedLocalesWithDisplayNames()
    {
        // Arrange
        var logger = Substitute.For<ILogger<PlatformHandler>>();
        var configuration = Substitute.For<IConfiguration>();

        // Act
        var result = PlatformHandler.HandleGetLocales(logger, configuration, CancellationToken.None);

        // Assert
        var okResult = result.ShouldBeOfType<Ok<GetLocalesResponse>>();
        okResult.Value.ShouldNotBeNull();
        okResult.Value.Locales.ShouldBe([
            new LocaleResponse("de-DE", "Deutsch (German)"),
            new LocaleResponse("en-GB", "English (British English)"),
            new LocaleResponse("en-US", "English (US English)"),
            new LocaleResponse("fr-FR", "Français (French)"),
            new LocaleResponse("ru-RU", "Русский (Russian)")
        ]);
    }
}
