using HomeBook.Backend.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace HomeBook.Backend.OpenApi;

/// <summary>
/// Adds the JWT bearer security scheme to the OpenAPI document and marks every operation
/// that requires authorization with a matching security requirement.
/// </summary>
/// <remarks>
/// An operation counts as protected when its endpoint metadata carries <see cref="IAuthorizeData"/>
/// without <see cref="IAllowAnonymous"/>, or when it carries <see cref="RequireAdminAttribute"/>.
/// Admin endpoints are guarded by a middleware instead of the authorization pipeline, so they
/// have no <see cref="IAuthorizeData"/> metadata and must be detected separately.
/// </remarks>
internal sealed class BearerSecuritySchemeTransformer : IOpenApiDocumentTransformer, IOpenApiOperationTransformer
{
    /// <summary>
    /// Name of the security scheme in <c>components.securitySchemes</c>.
    /// </summary>
    public const string SchemeName = "Bearer";

    /// <inheritdoc />
    public Task TransformAsync(OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes[SchemeName] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "JWT access token obtained from POST /account/login."
        };

        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task TransformAsync(OpenApiOperation operation,
        OpenApiOperationTransformerContext context,
        CancellationToken cancellationToken)
    {
        if (!RequiresAuthorization(context.Description.ActionDescriptor.EndpointMetadata))
            return Task.CompletedTask;

        operation.Security ??= [];
        operation.Security.Add(new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference(SchemeName, context.Document)] = []
        });

        return Task.CompletedTask;
    }

    /// <summary>
    /// Decides whether an endpoint with the given metadata requires a bearer token.
    /// </summary>
    /// <param name="endpointMetadata">The endpoint metadata collection.</param>
    /// <returns><c>true</c> when the endpoint requires authorization.</returns>
    internal static bool RequiresAuthorization(IEnumerable<object> endpointMetadata)
    {
        object[] metadata = endpointMetadata as object[] ?? endpointMetadata.ToArray();

        if (metadata.OfType<RequireAdminAttribute>().Any())
            return true;

        if (metadata.OfType<IAllowAnonymous>().Any())
            return false;

        return metadata.OfType<IAuthorizeData>().Any();
    }
}
