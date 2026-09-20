using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Models.System;

namespace HomeBook.Frontend.Services.Mappings;

public static class SystemInfoMappings
{
    public static SystemInfo ToSystemInfo(this GetSystemInfoResponse source)
    {
        if (source == null)
            throw new ArgumentNullException(nameof(source));

        return new SystemInfo(source.DotnetRuntimeVersion ?? string.Empty,
            new Version(source.AppVersion ?? "0.0.0"),
            (source.DatabaseProvider ?? string.Empty).AsDatabaseProviderForDisplay(),
            (source.DeploymentType ?? string.Empty).AsDeploymentTypeForDisplay());
    }

    public static string AsDeploymentTypeForDisplay(this string source)
    {
        return source.ToUpperInvariant() switch
        {
            "DOCKER" => "Docker",
            _ => source
        };
    }

    public static string AsDatabaseProviderForDisplay(this string source)
    {
        return source.ToUpperInvariant() switch
        {
            "POSTGRESQL" => "PostgreSQL",
            "MYSQL" => "MySQL",
            "MARIADB" => "MariaDB",
            _ => source
        };
    }
}
