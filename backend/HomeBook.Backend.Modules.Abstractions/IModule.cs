namespace HomeBook.Backend.Modules.Abstractions;

public interface IModule
{
    /// <summary>
    /// the display name of this module
    /// </summary>
    string Name { get; }

    /// <summary>
    /// the description of this module (for open api for example)
    /// </summary>
    string Description { get; }

    /// <summary>
    /// the key of this module (used for endpoint grouping, etc.)
    /// </summary>
    string Key { get; }

    /// <summary>
    /// the author of this module
    /// </summary>
    string Author { get; }

    /// <summary>
    /// the version of this module
    /// </summary>
    Version Version { get; }

    /// <summary>
    /// contains the initialization logic for the module.
    /// </summary>
    Task InitializeAsync();
}
