using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// definition for a database migrator
/// </summary>
public interface IDatabaseMigrator
{
    /// <summary>
    /// migrate the database to the latest version
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task MigrateAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// get the configured database context
    /// </summary>
    /// <returns>the configured AppDbContext</returns>
    DbContext GetDbContext();

    /// <summary>
    /// configure required services for the database provider
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    void ConfigureForServiceCollection(ServiceCollection services, IConfiguration configuration);
}
