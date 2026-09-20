namespace HomeBook.Frontend.Abstractions.Contracts;

/// <summary>
/// defines a registry for widgets associated with a specific module.
/// </summary>
public interface IWidgetRegistry
{
    /// <summary>
    /// the type of the module associated with this widget registry.
    /// </summary>
    Type ModuleType { get; }

    /// <summary>
    /// gets the type of the module associated with this widget registry.
    /// </summary>
    /// <returns></returns>
    Type GetModuleType();

    /// <summary>
    /// returns a read-only list of all widget types registered within the module.
    /// </summary>
    /// <returns></returns>
    IReadOnlyList<Type> GetWidgetTypes();
}
