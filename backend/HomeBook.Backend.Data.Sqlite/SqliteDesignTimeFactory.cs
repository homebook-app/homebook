using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace HomeBook.Backend.Data.Sqlite;

public sealed class SqliteDesignTimeFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        DbContextOptionsBuilder<AppDbContext> optionsBuilder = new();
        var filePath = "homebook.db";
        optionsBuilder.SetDbOptions(ConnectionStringBuilder.Build(filePath));

        return new AppDbContext(optionsBuilder.Options,
            null);
    }
}
