namespace HomeBook.Frontend.Modules.Abstractions;

/// <summary>
/// defines a builder for registering widgets within a module.
/// </summary>
public interface IWidgetBuilder
{
    /// <summary>
    /// adds a widget of type T to the module's widget collection.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <returns></returns>
    IWidgetBuilder AddWidget<T>() where T : class, IWidget;
}
