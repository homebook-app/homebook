using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace HomeBook.Backend.Data.PostgreSql;

public sealed class PostgreSqlDesignTimeFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        DbContextOptionsBuilder<AppDbContext> optionsBuilder = new();
        optionsBuilder.SetDbOptions(ConnectionStringBuilder.Build("localhost",
            "5432",
            "hb-migration",
            "db-migration",
            "this-is-not-a-password"));

        return new AppDbContext(optionsBuilder.Options,
            null);
    }
}
