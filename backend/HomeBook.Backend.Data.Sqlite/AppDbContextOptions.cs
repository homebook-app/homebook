using Microsoft.EntityFrameworkCore;

namespace HomeBook.Backend.Data.Sqlite;

public static class AppDbContextOptions
{
    private const string HISTORY_TABLE_NAME = "__EFMigrationsHistory";

    public static void SetDbOptions(this DbContextOptionsBuilder optionsBuilder,
        string connectionString)
    {
        string migrationAssembly = typeof(AppDbContextOptions).Namespace ?? string.Empty;
        optionsBuilder.UseSqlite(connectionString,
            x => x.MigrationsHistoryTable(HISTORY_TABLE_NAME)
                .MigrationsAssembly(migrationAssembly));
    }
}
