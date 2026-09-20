using Microsoft.AspNetCore.Routing;

namespace HomeBook.Backend.Modules.Abstractions;

public interface IEndpointBuilder
{
    IEndpointBuilder AddEndpoint(Action<IEndpointRouteBuilder> groupBuilderAction);
}
