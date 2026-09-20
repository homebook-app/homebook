using HomeBook.Backend.Abstractions;
using HomeBook.Backend.Abstractions.Contracts;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HomeBook.Backend.Core.Licenses.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBackendCoreLicenses(this IServiceCollection services,
        IConfiguration configuration,
        InstanceStatus instanceStatus)
    {
        services.AddSingleton<ILicenseProvider, LicenseProvider>();

        return services;
    }
}
