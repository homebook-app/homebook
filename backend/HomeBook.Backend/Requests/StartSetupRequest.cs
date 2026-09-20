namespace HomeBook.Backend.Requests;

/// <summary>
/// contains the request data for migrating the database.
/// </summary>
/// <param name="LicensesAccepted">if true, the user has accepted the licenses</param>
/// <param name="DatabaseType">the type of the database to migrate to, e.g. "PostgreSQL", "MySQL", etc.</param>
/// <param name="DatabaseHost">the host of the database server, e.g. "localhost"</param>
/// <param name="DatabasePort">the port of the database server, e.g. 5432 for PostgreSQL, 3306 for MySQL</param>
/// <param name="DatabaseName">the name of the database to migrate to</param>
/// <param name="DatabaseUserName">the username for the database user</param>
/// <param name="DatabaseUserPassword">the password for the database user</param>
/// <param name="HomebookUserName">the username for the Homebook user</param>
/// <param name="HomebookUserPassword">the password for the Homebook user</param>
/// <param name="HomebookConfigurationName">the name of the Homebook instance</param>
/// <param name="HomebookConfigurationDefaultLocale">the default locale of the Homebook instance, e.g. "en-EN", "de-DE", etc.</param>
/// <param name="DatabaseFile">the file path for the SQLite database file, e.g. "/var/lib/homebook/homebook.db"</param>
public record StartSetupRequest(
    bool? LicensesAccepted,
    string? DatabaseType,
    string? DatabaseHost,
    ushort? DatabasePort,
    string? DatabaseName,
    string? DatabaseUserName,
    string? DatabaseUserPassword,
    string? HomebookUserName,
    string? HomebookUserPassword,
    string? HomebookConfigurationName,
    string? HomebookConfigurationDefaultLocale,
    string? DatabaseFile = null);
