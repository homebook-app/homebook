namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// defines a contract for update migrators that handle specific version updates.
/// </summary>
public interface IUpdateMigrator
{
    /// <summary>
    /// the version that this migrator is responsible for updating to.
    /// </summary>
    Version Version { get; }

    /// <summary>
    /// the description of the update being applied.
    /// </summary>
    string Description { get; }

    /// <summary>
    /// execute the update migration logic.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task ExecuteAsync(CancellationToken cancellationToken);
}
