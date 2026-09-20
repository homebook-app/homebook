using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HomeBook.Backend.Modules.Abstractions;

public interface IBackendModuleServiceRegistrar
{
    /// <summary>
    /// register required services for this module.
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    static abstract void RegisterServices(IServiceCollection services,
        IConfiguration configuration);
}
