namespace HomeBook.Backend.Data.PostgreSql;

/// <summary>
/// Builder for PostgreSQL connection strings
/// </summary>
public class ConnectionStringBuilder
{
    /// <summary>
    /// Builds a PostgreSQL connection string from the provided parameters
    /// </summary>
    /// <param name="host">The database host</param>
    /// <param name="port">The database port</param>
    /// <param name="database">The database name</param>
    /// <param name="username">The database username</param>
    /// <param name="password">The database password</param>
    /// <returns>A formatted PostgreSQL connection string</returns>
    /// <exception cref="ArgumentException">Thrown when any parameter is null or whitespace</exception>
    public static string Build(string host, string port, string database, string username, string password)
    {
        ValidateParameters(host, port, database, username, password);

        // Escape parameters that might contain special characters
        var escapedHost = EscapeConnectionStringValue(host);
        var escapedDatabase = EscapeConnectionStringValue(database);
        var escapedUsername = EscapeConnectionStringValue(username);
        var escapedPassword = EscapeConnectionStringValue(password);

        return $"Host={escapedHost};Port={port};Database={escapedDatabase};Username={escapedUsername};Password={escapedPassword};";
    }

    /// <summary>
    /// Builds a PostgreSQL connection string from the provided parameters with additional options
    /// </summary>
    /// <param name="host">The database host</param>
    /// <param name="port">The database port</param>
    /// <param name="database">The database name</param>
    /// <param name="username">The database username</param>
    /// <param name="password">The database password</param>
    /// <param name="sslMode">SSL mode (default: Prefer)</param>
    /// <param name="timeout">Connection timeout in seconds (default: 30)</param>
    /// <returns>A formatted PostgreSQL connection string with additional options</returns>
    /// <exception cref="ArgumentException">Thrown when any required parameter is null or whitespace</exception>
    public static string BuildWithOptions(string host, string port, string database, string username, string password,
        string sslMode = "Prefer", int timeout = 30)
    {
        ValidateParameters(host, port, database, username, password);

        // Escape parameters that might contain special characters
        var escapedHost = EscapeConnectionStringValue(host);
        var escapedDatabase = EscapeConnectionStringValue(database);
        var escapedUsername = EscapeConnectionStringValue(username);
        var escapedPassword = EscapeConnectionStringValue(password);

        return $"Host={escapedHost};Port={port};Database={escapedDatabase};Username={escapedUsername};Password={escapedPassword};SSL Mode={sslMode};Timeout={timeout};";
    }

    /// <summary>
    /// Escapes special characters in connection string values
    /// </summary>
    /// <param name="value">The value to escape</param>
    /// <returns>Escaped value safe for use in connection strings</returns>
    private static string EscapeConnectionStringValue(string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        // PostgreSQL connection string escaping:
        // - Wrap in single quotes if value contains semicolon, equals, or quotes
        // - Escape single quotes by doubling them
        if (value.Contains(';') || value.Contains('=') || value.Contains('\'') || value.Contains('"') ||
            value.Contains(' ') || value.Contains('\\'))
        {
            // Escape single quotes by doubling them
            var escaped = value.Replace("'", "''");
            return $"'{escaped}'";
        }

        return value;
    }

    private static void ValidateParameters(string host, string port, string database, string username, string password)
    {
        if (string.IsNullOrWhiteSpace(host))
            throw new ArgumentException("Host cannot be null or empty", nameof(host));

        if (string.IsNullOrWhiteSpace(port))
            throw new ArgumentException("Port cannot be null or empty", nameof(port));

        if (string.IsNullOrWhiteSpace(database))
            throw new ArgumentException("Database cannot be null or empty", nameof(database));

        if (string.IsNullOrWhiteSpace(username))
            throw new ArgumentException("Username cannot be null or empty", nameof(username));

        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Password cannot be null or empty", nameof(password));
    }
}
