using HomeBook.Backend.Core.Modules.OpenApi;
using HomeBook.Backend.Module.Finances.Handler;
using HomeBook.Backend.Module.Finances.Responses;
using HomeBook.Backend.Modules.Abstractions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace HomeBook.Backend.Module.Finances.Endpoints;

public static class SavingGoalEndpoints
{
    public static IEndpointBuilder MapSavingGoalEndpoints(this IEndpointBuilder builder)
    {
        builder.AddEndpoint(routeBuilder =>
        {
            RouteGroupBuilder group = routeBuilder
                .MapGroup("/saving-goals")
                .WithDescription("Endpoints to manage finances saving goals")
                .RequireAuthorization();

            group.MapGet("/", SavingGoalHandler.HandleGetSavingGoals)
                .WithName("GetSavingGoals")
                .WithDescription(new Description(
                    "returns the users finances saving goals",
                    "HTTP 200: Finances saving goals were found",
                    "HTTP 401: User is not authorized",
                    "HTTP 500: Unknown error while getting saving goals"))
                .RequireAuthorization()
                .Produces<SavingGoalListResponse>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces<string>(StatusCodes.Status500InternalServerError);

            group.MapPost("/", SavingGoalHandler.HandleCreateSavingGoal)
                .WithName("CreateSavingGoal")
                .WithDescription(new Description(
                    "creates a new finances saving goal for the user",
                    "HTTP 201: Finances saving goal was created",
                    "HTTP 400: Invalid request data",
                    "HTTP 401: User is not authorized",
                    "HTTP 500: Unknown error while creating saving goal"))
                .RequireAuthorization()
                .Produces(StatusCodes.Status201Created)
                .Produces<string>(StatusCodes.Status400BadRequest)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces<string>(StatusCodes.Status500InternalServerError);

            group.MapPatch("/{savingGoalId:guid}/name", SavingGoalHandler.HandleUpdateSavingGoalName)
                .WithName("UpdateSavingGoalName")
                .WithDescription(new Description(
                    "updates the name of an existing finances saving goal for the user",
                    "HTTP 200: Finances saving goal was updated",
                    "HTTP 400: Invalid request data",
                    "HTTP 401: User is not authorized",
                    "HTTP 404: Saving goal not found",
                    "HTTP 500: Unknown error while updating saving goal"))
                .RequireAuthorization()
                .Produces(StatusCodes.Status200OK)
                .Produces<string>(StatusCodes.Status400BadRequest)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces<string>(StatusCodes.Status404NotFound)
                .Produces<string>(StatusCodes.Status500InternalServerError);

            group.MapPatch("/{savingGoalId:guid}/appearance", SavingGoalHandler.HandleUpdateSavingGoalAppearance)
                .WithName("UpdateSavingGoalAppearance")
                .WithDescription(new Description(
                    "updates the appearance of an existing finances saving goal for the user",
                    "HTTP 200: Finances saving goal was updated",
                    "HTTP 400: Invalid request data",
                    "HTTP 401: User is not authorized",
                    "HTTP 404: Saving goal not found",
                    "HTTP 500: Unknown error while updating saving goal"))
                .RequireAuthorization()
                .Produces(StatusCodes.Status200OK)
                .Produces<string>(StatusCodes.Status400BadRequest)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces<string>(StatusCodes.Status404NotFound)
                .Produces<string>(StatusCodes.Status500InternalServerError);

            group.MapPatch("/{savingGoalId:guid}/amounts", SavingGoalHandler.HandleUpdateSavingGoalAmounts)
                .WithName("UpdateSavingGoalAmounts")
                .WithDescription(new Description(
                    "updates the amounts of an existing finances saving goal for the user",
                    "HTTP 200: Finances saving goal was updated",
                    "HTTP 400: Invalid request data",
                    "HTTP 401: User is not authorized",
                    "HTTP 404: Saving goal not found",
                    "HTTP 500: Unknown error while updating saving goal"))
                .RequireAuthorization()
                .Produces(StatusCodes.Status200OK)
                .Produces<string>(StatusCodes.Status400BadRequest)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces<string>(StatusCodes.Status404NotFound)
                .Produces<string>(StatusCodes.Status500InternalServerError);

            group.MapPatch("/{savingGoalId:guid}/info", SavingGoalHandler.HandleUpdateSavingGoalInfo)
                .WithName("UpdateSavingGoalInfo")
                .WithDescription(new Description(
                    "updates the info (target date, etc.) of an existing finances saving goal for the user",
                    "HTTP 200: Finances saving goal was updated",
                    "HTTP 400: Invalid request data",
                    "HTTP 401: User is not authorized",
                    "HTTP 404: Saving goal not found",
                    "HTTP 500: Unknown error while updating saving goal"))
                .RequireAuthorization()
                .Produces(StatusCodes.Status200OK)
                .Produces<string>(StatusCodes.Status400BadRequest)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces<string>(StatusCodes.Status404NotFound)
                .Produces<string>(StatusCodes.Status500InternalServerError);

            group.MapDelete("/{id:guid}", SavingGoalHandler.HandleDeleteSavingGoal)
                .WithName("DeleteSavingGoal")
                .WithDescription(new Description(
                    "deletes an existing finances saving goal for the user",
                    "HTTP 200: Finances saving goal was deleted",
                    "HTTP 401: User is not authorized",
                    "HTTP 404: Saving goal not found",
                    "HTTP 500: Unknown error while deleting saving goal"))
                .RequireAuthorization()
                .Produces(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces<string>(StatusCodes.Status404NotFound)
                .Produces<string>(StatusCodes.Status500InternalServerError);
        });

        return builder;
    }
}
