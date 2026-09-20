using HomeBook.Backend.Abstractions;
using HomeBook.Backend.Abstractions.Contracts;
using HomeBook.Backend.Core.HashProvider;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HomeBook.Backend.Core.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBackendCore(this IServiceCollection services,
        IConfiguration configuration,
        InstanceStatus instanceStatus)
    {
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddSingleton<IStringNormalizer, StringNormalizer>();

        services.AddSingleton<IHashProviderFactory, HashProviderFactory>();

        return services;
    }
}
