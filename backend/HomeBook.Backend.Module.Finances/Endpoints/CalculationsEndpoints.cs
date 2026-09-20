using HomeBook.Backend.Core.Modules.OpenApi;
using HomeBook.Backend.Module.Finances.Handler;
using HomeBook.Backend.Module.Finances.Responses;
using HomeBook.Backend.Modules.Abstractions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace HomeBook.Backend.Module.Finances.Endpoints;

public static class FinanceCalculationsEndpoints
{
    public static IEndpointBuilder MapCalculationEndpoints(this IEndpointBuilder builder)
    {
        builder.AddEndpoint(routeBuilder =>
        {
            RouteGroupBuilder group = routeBuilder
                .MapGroup("/calculations")
                .WithDescription("Endpoints to manage finances calculations")
                .RequireAuthorization();

            group.MapPost("/savings", CalculationsHandler.HandleCalculateSavings)
                .WithName("CalculateSavings")
                .WithDescription(new Description(
                    "returns the calculated savings based on the provided parameters",
                    "HTTP 200: successfully calculated savings",
                    "HTTP 401: User is not authorized",
                    "HTTP 500: Unknown error while getting saving goals"))
                .RequireAuthorization()
                .Produces<CalculatedSavingResponse>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces<string>(StatusCodes.Status500InternalServerError);
        });

        return builder;
    }
}
