namespace HomeBook.Backend.Data.Sqlite;

public class ConnectionStringBuilder
{
    /// <summary>
    /// Builds a Sqlite connection string from the provided file path
    /// </summary>
    /// <param name="filePath">The database file path</param>
    /// <exception cref="ArgumentException">Thrown when any parameter is null or whitespace</exception>
    public static string Build(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath))
            throw new ArgumentException("File path cannot be null or empty", nameof(filePath));

        return $"Data Source={filePath};";
    }

    /// <summary>
    /// Builds a Sqlite in-memory connection string
    /// </summary>
    public static string BuildInMemory()
    {
        return "Data Source=HomeBook;Mode=Memory;Cache=Shared";
    }
}
