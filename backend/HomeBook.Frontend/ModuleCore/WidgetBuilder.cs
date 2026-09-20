using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Modules.Abstractions;

namespace HomeBook.Frontend.ModuleCore;

/// <summary>
/// the widget builder
/// </summary>
/// <typeparam name="TModule"></typeparam>
public class WidgetBuilder<TModule> : IWidgetBuilder, IWidgetRegistry
{
    private readonly List<Type> _widgetTypes = new();

    /// <inheritdoc />
    public Type ModuleType { get; } = typeof(TModule);

    /// <inheritdoc />
    public IWidgetBuilder AddWidget<TWidget>() where TWidget : class, IWidget
    {
        // Store only the widget type, not an instance
        Type widgetType = typeof(TWidget);
        if (!_widgetTypes.Contains(widgetType))
        {
            _widgetTypes.Add(widgetType);
        }

        return this;
    }

    /// <inheritdoc />
    public Type GetModuleType()
    {
        return typeof(TModule);
    }

    /// <inheritdoc />
    public IReadOnlyList<Type> GetWidgetTypes()
    {
        return _widgetTypes.AsReadOnly();
    }
}
