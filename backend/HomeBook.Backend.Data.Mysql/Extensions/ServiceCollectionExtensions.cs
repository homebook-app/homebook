using HomeBook.Backend.Abstractions.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HomeBook.Backend.Data.Mysql.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBackendDataMysqlProbe(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSingleton<IDatabaseProbe, MysqlProbe>();

        return services;
    }

    public static IServiceCollection AddBackendDataMysql(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSingleton<IDatabaseManager, DatabaseManager>();

        // Initialize Database
        services.AddDbContextPool<AppDbContext>((sp, optionsBuilder) =>
            CreateDbContextOptionsBuilder(configuration, sp, optionsBuilder));

        services.AddDbContextFactory<AppDbContext>((sp, optionsBuilder) =>
            CreateDbContextOptionsBuilder(configuration, sp, optionsBuilder));

        return services;
    }

    public static void CreateDbContextOptionsBuilder(IConfiguration configuration,
        IServiceProvider sp,
        DbContextOptionsBuilder optionsBuilder)
    {
        string? host = configuration["Database:Host"];
        string? port = configuration["Database:Port"];
        string? database = configuration["Database:InstanceDbName"];
        string? username = configuration["Database:Username"];
        string? password = configuration["Database:Password"];

        string connectionString = ConnectionStringBuilder.Build(host!, port!, database!, username!, password!);

        optionsBuilder.SetDbOptions(connectionString);

        IEnumerable<SaveChangesInterceptor> saveChangesInterceptors = sp.GetServices<SaveChangesInterceptor>();
        optionsBuilder.AddInterceptors(saveChangesInterceptors);
    }
}
