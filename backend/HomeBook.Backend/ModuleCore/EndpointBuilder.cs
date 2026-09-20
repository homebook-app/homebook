using HomeBook.Backend.Abstractions.Contracts;
using HomeBook.Backend.Modules.Abstractions;

namespace HomeBook.Backend.ModuleCore;

public class EndpointBuilder(IEndpointRouteBuilder groupBuilder)
    : IEndpointBuilder,
        IEndpointDataAccessor
{
    public IEndpointBuilder AddEndpoint(Action<IEndpointRouteBuilder> groupBuilderAction)
    {
        groupBuilderAction(groupBuilder);

        return this;
    }
}
