using HomeBook.Backend.Handler;

namespace HomeBook.Backend.Endpoints;

public static class VersionEndpoints
{
    public static IEndpointRouteBuilder MapVersionEndpoints(this IEndpointRouteBuilder routeBuilder)
    {
        RouteGroupBuilder group = routeBuilder
            .MapGroup("/version")
            .WithDescription("Endpoints for application version");

        group.MapGet("/", VersionHandler.HandleGetVersion)
            .WithName("GetVersion")
            .WithTags("Version")
            .WithDescription("returns the version of the backend service")
            // .RequireAuthorization(policy => policy.RequireRole("read"))
            .Produces<string>(StatusCodes.Status200OK)
            .Produces<string>(StatusCodes.Status500InternalServerError);

        return routeBuilder;
    }
}
