using HomeBook.Backend.Abstractions;
using HomeBook.Backend.Abstractions.Contracts;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HomeBook.Backend.Core.DataProvider.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBackendCoreDataProvider(this IServiceCollection services,
        IConfiguration configuration,
        InstanceStatus instanceStatus)
    {
        services.AddScoped<IUserProvider, UserProvider>();
        services.AddScoped<IInstanceConfigurationProvider, InstanceConfigurationProvider>();
        services.AddScoped<IUserPreferenceProvider, UserPreferenceProvider>();

        return services;
    }
}
