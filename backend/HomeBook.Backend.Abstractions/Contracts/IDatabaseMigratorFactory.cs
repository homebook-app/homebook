namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// creates database migrators
/// </summary>
public interface IDatabaseMigratorFactory
{
    /// <summary>
    /// creates a database migrator for the given database type
    /// </summary>
    /// <param name="databaseType"></param>
    /// <returns></returns>
    IDatabaseMigrator CreateMigrator(string databaseType);
}
