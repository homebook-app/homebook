using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Modules.Abstractions;

namespace HomeBook.Frontend.ModuleCore;

/// <inheritdoc />
public class WidgetFactory : IWidgetFactory
{
    private Guid _instanceId = Guid.NewGuid();
    private Dictionary<string, IWidgetBuilder> _widgetBuilders = new();

    /// <inheritdoc />
    public void AddWidgetBuilder(string moduleId, IWidgetBuilder widgetBuilder)
    {
        _widgetBuilders.TryAdd(moduleId, widgetBuilder);
    }

    /// <inheritdoc />
    public IReadOnlyList<Type> GetWidgetTypesForModule(string moduleId)
    {
        IWidgetBuilder? widgetBuilder = _widgetBuilders.GetValueOrDefault(moduleId);
        if (widgetBuilder is null)
            return [];

        IWidgetRegistry widgetRegistry = widgetBuilder as IWidgetRegistry
                                         ?? throw new InvalidOperationException(
                                             "WidgetBuilder must implement IWidgetRegistry.");

        return widgetRegistry.GetWidgetTypes();
    }

    /// <inheritdoc />
    public IReadOnlyList<Type> GetAllWidgetTypes()
    {
        List<Type> allWidgetTypes = [];
        foreach (IWidgetBuilder widgetBuilder in _widgetBuilders.Values)
        {
            IWidgetRegistry widgetRegistry = widgetBuilder as IWidgetRegistry
                                             ?? throw new InvalidOperationException(
                                                 "WidgetBuilder must implement IWidgetRegistry.");

            allWidgetTypes.AddRange(widgetRegistry.GetWidgetTypes());
        }

        return allWidgetTypes;
    }
}
