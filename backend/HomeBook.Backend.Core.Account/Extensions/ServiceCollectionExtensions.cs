using HomeBook.Backend.Abstractions;
using HomeBook.Backend.Abstractions.Contracts;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HomeBook.Backend.Core.Account.Extensions;

/// <summary>
/// Extension methods for Account service registration
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds Account services to the dependency injection container
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <returns>The service collection for chaining</returns>
    public static IServiceCollection AddAccountServices(this IServiceCollection services,
        IConfiguration configuration,
        InstanceStatus instanceStatus)
    {
        services.AddScoped<IAccountProvider, AccountProvider>();

        return services;
    }
}
