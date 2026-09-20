using HomeBook.Frontend.Modules.Abstractions;

namespace HomeBook.Frontend.Abstractions.Contracts;

public interface IWidgetFactory
{
    void AddWidgetBuilder(string moduleId, IWidgetBuilder widgetBuilder);
    IReadOnlyList<Type> GetWidgetTypesForModule(string moduleId);
    IReadOnlyList<Type> GetAllWidgetTypes();
}
