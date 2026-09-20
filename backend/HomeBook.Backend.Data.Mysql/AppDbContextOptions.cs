using Microsoft.EntityFrameworkCore;

namespace HomeBook.Backend.Data.Mysql;

public static class AppDbContextOptions
{
    private const string HISTORY_TABLE_NAME = "__EFMigrationsHistory";

    public static void SetDbOptions(this DbContextOptionsBuilder optionsBuilder,
        string connectionString)
    {
        string migrationAssembly = typeof(AppDbContextOptions).Namespace ?? string.Empty;
        optionsBuilder.UseMySQL(connectionString,
            x => x.MigrationsHistoryTable(HISTORY_TABLE_NAME)
                .EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null)
                .MigrationsAssembly(migrationAssembly)
        );
    }
}
