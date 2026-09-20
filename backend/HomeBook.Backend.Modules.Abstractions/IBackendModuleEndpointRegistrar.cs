using Microsoft.Extensions.Configuration;

namespace HomeBook.Backend.Modules.Abstractions;

public interface IBackendModuleEndpointRegistrar
{
    void RegisterEndpoints(IEndpointBuilder builder,
        IConfiguration configuration);
}
