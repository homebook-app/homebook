using HomeBook.Backend.Attributes;
using HomeBook.Backend.OpenApi;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;

namespace HomeBook.UnitTests.Backend.OpenApi;

[TestFixture]
public class BearerSecuritySchemeTransformerTests
{
    private BearerSecuritySchemeTransformer _transformer = null!;
    private ServiceProvider _services = null!;

    [SetUp]
    public void SetUp()
    {
        _transformer = new BearerSecuritySchemeTransformer();
        _services = new ServiceCollection().BuildServiceProvider();
    }

    [TearDown]
    public void TearDown()
    {
        _services.Dispose();
    }

    [Test]
    public async Task TransformAsync_Document_AddsBearerScheme()
    {
        // Arrange
        var document = new OpenApiDocument();
        var context = CreateDocumentContext();

        // Act
        await _transformer.TransformAsync(document, context, CancellationToken.None);

        // Assert
        document.Components.ShouldNotBeNull();
        document.Components.SecuritySchemes.ShouldNotBeNull();
        document.Components.SecuritySchemes.ShouldContainKey(BearerSecuritySchemeTransformer.SchemeName);
        IOpenApiSecurityScheme scheme = document.Components.SecuritySchemes[BearerSecuritySchemeTransformer.SchemeName];
        scheme.Type.ShouldBe(SecuritySchemeType.Http);
        scheme.Scheme.ShouldBe("bearer");
        scheme.BearerFormat.ShouldBe("JWT");
        scheme.In.ShouldBe(ParameterLocation.Header);
    }

    [Test]
    public async Task TransformAsync_Document_CalledTwice_KeepsSingleScheme()
    {
        // Arrange
        var document = new OpenApiDocument();
        var context = CreateDocumentContext();

        // Act
        await _transformer.TransformAsync(document, context, CancellationToken.None);
        await _transformer.TransformAsync(document, context, CancellationToken.None);

        // Assert
        document.Components!.SecuritySchemes!.Count.ShouldBe(1);
    }

    [Test]
    public async Task TransformAsync_Operation_WithAuthorize_AddsSecurityRequirement()
    {
        // Arrange
        var operation = new OpenApiOperation();
        var context = CreateOperationContext(new AuthorizeAttribute());

        // Act
        await _transformer.TransformAsync(operation, context, CancellationToken.None);

        // Assert
        operation.Security.ShouldNotBeNull();
        operation.Security.Count.ShouldBe(1);
        OpenApiSecurityRequirement requirement = operation.Security[0];
        requirement.Keys.Single().Reference.Id.ShouldBe(BearerSecuritySchemeTransformer.SchemeName);
        requirement.Values.Single().ShouldBeEmpty();
    }

    [Test]
    public async Task TransformAsync_Operation_WithRequireAdmin_AddsSecurityRequirement()
    {
        // Arrange
        var operation = new OpenApiOperation();
        var context = CreateOperationContext(new RequireAdminAttribute());

        // Act
        await _transformer.TransformAsync(operation, context, CancellationToken.None);

        // Assert
        operation.Security.ShouldNotBeNull();
        operation.Security.Count.ShouldBe(1);
    }

    [Test]
    public async Task TransformAsync_Operation_WithAllowAnonymous_AddsNothing()
    {
        // Arrange
        var operation = new OpenApiOperation();
        var context = CreateOperationContext(new AuthorizeAttribute(), new AllowAnonymousAttribute());

        // Act
        await _transformer.TransformAsync(operation, context, CancellationToken.None);

        // Assert
        operation.Security.ShouldBeNull();
    }

    [Test]
    public async Task TransformAsync_Operation_WithoutMetadata_AddsNothing()
    {
        // Arrange
        var operation = new OpenApiOperation();
        var context = CreateOperationContext();

        // Act
        await _transformer.TransformAsync(operation, context, CancellationToken.None);

        // Assert
        operation.Security.ShouldBeNull();
    }

    [Test]
    public void RequiresAuthorization_AdminWithAllowAnonymous_ReturnsTrue()
    {
        // Arrange
        object[] metadata = [new AllowAnonymousAttribute(), new RequireAdminAttribute()];

        // Act
        bool result = BearerSecuritySchemeTransformer.RequiresAuthorization(metadata);

        // Assert
        result.ShouldBeTrue();
    }

    private OpenApiDocumentTransformerContext CreateDocumentContext()
        => new()
        {
            DocumentName = "v1",
            DescriptionGroups = [],
            ApplicationServices = _services
        };

    private OpenApiOperationTransformerContext CreateOperationContext(params object[] endpointMetadata)
        => new()
        {
            DocumentName = "v1",
            Description = new ApiDescription
            {
                ActionDescriptor = new ActionDescriptor
                {
                    EndpointMetadata = endpointMetadata
                }
            },
            ApplicationServices = _services,
            Document = new OpenApiDocument()
        };
}
