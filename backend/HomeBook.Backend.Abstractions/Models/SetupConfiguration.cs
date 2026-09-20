namespace HomeBook.Backend.Abstractions.Models;

/// <summary>
/// contains the final setup configuration for the setup process.
/// </summary>
public class SetupConfiguration
{
    /// <summary>
    /// the type of the database which should used by the application, e.g. "PostgreSQL", "MySQL", etc.
    /// </summary>
    public required string DatabaseType { get; init; }

    /// <summary>
    /// the name for the Homebook instance.
    /// </summary>
    public required string HomebookConfigurationName { get; init; }

    /// <summary>
    /// the default locale for the Homebook instance, e.g. "en-EN", "de-DE", etc.
    /// </summary>
    public required string HomebookConfigurationDefaultLocale { get; init; }

    /// <summary>
    /// the username for the Homebook user, which is used as primary administrator.
    /// </summary>
    public required string HomebookUserName { get; init; }

    /// <summary>
    /// the password for the Homebook user, which is used as primary administrator.
    /// </summary>
    public required string HomebookUserPassword { get; init; }

    /// <summary>
    /// if not null the licenses are accepted.
    /// </summary>
    public required bool HomebookAcceptLicenses { get; init; }

    /// <summary>
    /// the hostname or IP address of the database server.
    /// </summary>
    public string? DatabaseHost { get; set; }

    /// <summary>
    /// the port number on which the database server is listening.
    /// </summary>
    public ushort? DatabasePort { get; set; }

    /// <summary>
    /// the name of the database which should used by the application.
    /// </summary>
    public string? DatabaseName { get; set; }

    /// <summary>
    /// the username for accessing the database.
    /// </summary>
    public string? DatabaseUserName { get; set; }

    /// <summary>
    /// the password for the database user.
    /// </summary>
    public string? DatabaseUserPassword { get; set; }

    /// <summary>
    /// the file path for the SQLite database file, e.g. "/var/lib/homebook/homebook.db"
    /// </summary>
    public string? DatabaseFile { get; set; }
}
