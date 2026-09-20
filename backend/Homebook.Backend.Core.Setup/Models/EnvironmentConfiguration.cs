namespace Homebook.Backend.Core.Setup.Models;

/// <summary>
/// contains the environment configuration for the setup process.
/// </summary>
/// <param name="DatabaseType">the type of the database which should used by the application, e.g. "PostgreSQL", "MySQL", etc.</param>
/// <param name="DatabaseFile">the file path for the SQLite database file, e.g. "/var/lib/homebook/homebook.db".</param>
/// <param name="DatabaseHost">the hostname or IP address of the database server.</param>
/// <param name="DatabasePort">the port number on which the database server is listening.</param>
/// <param name="DatabaseName">the name of the database which should used by the application.</param>
/// <param name="DatabaseUserName">the username for accessing the database.</param>
/// <param name="DatabaseUserPassword">the password for the database user.</param>
/// <param name="HomebookUserName">the username for the Homebook user, which is used as primary administrator.</param>
/// <param name="HomebookUserPassword">the password for the Homebook user, which is used as primary administrator.</param>
/// <param name="HomebookAcceptLicenses">if not null the licenses are accepted.</param>
public record EnvironmentConfiguration(
    string? DatabaseType,
    string? DatabaseFile,
    string? DatabaseHost,
    string? DatabasePort,
    string? DatabaseName,
    string? DatabaseUserName,
    string? DatabaseUserPassword,
    string? HomebookUserName,
    string? HomebookUserPassword,
    string? HomebookAcceptLicenses);
