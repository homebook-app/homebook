using Microsoft.EntityFrameworkCore;

namespace HomeBook.Backend.Data.PostgreSql;

public static class AppDbContextOptions
{
    private const string HISTORY_TABLE_NAME = "__EFMigrationsHistory";

    public static void SetDbOptions(this DbContextOptionsBuilder optionsBuilder,
        string connectionString)
    {
        string migrationAssembly = typeof(AppDbContextOptions).Namespace ?? string.Empty;
        optionsBuilder.UseNpgsql(connectionString,
            x => x.MigrationsHistoryTable(HISTORY_TABLE_NAME)
                .EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null)
                .MigrationsAssembly(migrationAssembly)
        );
    }
}
