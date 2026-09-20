using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace HomeBook.Backend.Data.Mysql;

public class MySqlDesignTimeFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        DbContextOptionsBuilder<AppDbContext> optionsBuilder = new();
        optionsBuilder.SetDbOptions(ConnectionStringBuilder.Build("localhost",
            "3306",
            "hb-migration",
            "db-migration",
            "this-is-not-a-password"));

        return new AppDbContext(optionsBuilder.Options,
            null);
    }
}
