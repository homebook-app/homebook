namespace HomeBook.Backend.Data.Mysql;

/// <summary>
/// Builder for MySQL connection strings
/// </summary>
public class ConnectionStringBuilder
{
    /// <summary>
    /// Builds a MySQL connection string from the provided parameters
    /// </summary>
    /// <param name="host">The database host</param>
    /// <param name="port">The database port</param>
    /// <param name="database">The database name</param>
    /// <param name="username">The database username</param>
    /// <param name="password">The database password</param>
    /// <returns>A formatted MySQL connection string</returns>
    /// <exception cref="ArgumentException">Thrown when any parameter is null or whitespace</exception>
    public static string Build(string host, string port, string database, string username, string password)
    {
        ValidateParameters(host, port, database, username, password);

        // Escape parameters that might contain special characters
        var escapedHost = EscapeConnectionStringValue(host);
        var escapedDatabase = EscapeConnectionStringValue(database);
        var escapedUsername = EscapeConnectionStringValue(username);
        var escapedPassword = EscapeConnectionStringValue(password);

        return $"Server={escapedHost};Port={port};Database={escapedDatabase};Uid={escapedUsername};Pwd={escapedPassword};";
    }

    /// <summary>
    /// Builds a MySQL connection string from the provided parameters with additional options
    /// </summary>
    /// <param name="host">The database host</param>
    /// <param name="port">The database port</param>
    /// <param name="database">The database name</param>
    /// <param name="username">The database username</param>
    /// <param name="password">The database password</param>
    /// <param name="sslMode">SSL mode (default: Preferred)</param>
    /// <param name="connectionTimeout">Connection timeout in seconds (default: 30)</param>
    /// <param name="charset">Character set (default: utf8mb4)</param>
    /// <returns>A formatted MySQL connection string with additional options</returns>
    /// <exception cref="ArgumentException">Thrown when any required parameter is null or whitespace</exception>
    public static string BuildWithOptions(string host, string port, string database, string username, string password,
        string sslMode = "Preferred", int connectionTimeout = 30, string charset = "utf8mb4")
    {
        ValidateParameters(host, port, database, username, password);

        // Escape parameters that might contain special characters
        var escapedHost = EscapeConnectionStringValue(host);
        var escapedDatabase = EscapeConnectionStringValue(database);
        var escapedUsername = EscapeConnectionStringValue(username);
        var escapedPassword = EscapeConnectionStringValue(password);

        return $"Server={escapedHost};Port={port};Database={escapedDatabase};Uid={escapedUsername};Pwd={escapedPassword};SSL Mode={sslMode};Connection Timeout={connectionTimeout};Charset={charset};";
    }

    /// <summary>
    /// Escapes special characters in connection string values for MySQL
    /// </summary>
    /// <param name="value">The value to escape</param>
    /// <returns>Escaped value safe for use in MySQL connection strings</returns>
    private static string EscapeConnectionStringValue(string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        // MySQL connection string escaping:
        // - Wrap in quotes if value contains semicolon, equals, or special chars
        // - Escape quotes by doubling them or using backslash
        if (value.Contains(';') || value.Contains('=') || value.Contains('\'') || value.Contains('"') ||
            value.Contains(' ') || value.Contains('\\') || value.Contains(',') || value.Contains('<') || value.Contains('>'))
        {
            // For MySQL, we can use double quotes and escape any double quotes inside
            var escaped = value.Replace("\"", "\\\"").Replace("\\", "\\\\").Replace("'", "''");
            return $"\"{escaped}\"";
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
