using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Modules.Abstractions;
using HomeBook.Frontend.ViewModels;

namespace HomeBook.Frontend.ModuleCore;

/// <inheritdoc />
public class StartMenuBuilder : IStartMenuBuilder, IStartMenuRegistrator
{
    private readonly List<StartMenuBuilderItem> _startMenuItems = new();
    private string? _currentModuleId;

    public void WithModule(string moduleId) => _currentModuleId = moduleId;

    /// <inheritdoc />
    public IStartMenuBuilder AddStartMenuTile(string Title,
        string Caption,
        string Url,
        string Icon,
        string Color)
    {
        // var stack = new StackTrace();
        // var frame = stack.GetFrame(1); // 0 = aktuelle Methode, 1 = Aufrufer
        // var method = frame?.GetMethod();
        // var declaringType = method?.DeclaringType;
        //
        // var fullName = declaringType?.FullName;
        // var methodName = method?.Name;
        if (string.IsNullOrEmpty(_currentModuleId))
            throw new ArgumentNullException(nameof(_currentModuleId),
                "You must call WithModule before adding start menu items.");

        _startMenuItems.Add(new StartMenuBuilderItem(Title,
            Caption,
            Url,
            Icon,
            Color,
            _currentModuleId));

        return this;
    }

    public StartMenuBuilderItem[] GetStartMenuItems() => _startMenuItems.ToArray();

    public void RegisterStartMenuItems(IServiceCollection services,
        IConfiguration configuration)
    {
        StartMenuBuilderItem[] menuItems = GetStartMenuItems();
        foreach (StartMenuBuilderItem smi in menuItems)
        {
            services.AddSingleton<IStartMenuItem>(x => new StartMenuItemViewModel(
                x.GetRequiredKeyedService<IModule>(smi.ModuleId),
                smi.Title,
                smi.Caption,
                smi.Url,
                smi.Icon,
                smi.Color));
        }
    }
}
