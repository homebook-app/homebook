using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Modules.Abstractions;

namespace HomeBook.Frontend.ViewModels;

public class StartMenuItemViewModel(
    IModule module,
    string title,
    string caption,
    string url,
    string icon,
    string color) : IStartMenuItem
{
    public string Title { get; } = title;
    public string Caption { get; } = caption;
    public string Url { get; } = url;
    public string Icon { get; } = icon;
    public string Color { get; } = color;
    string IStartMenuItem.Translate(string key, params object[] args) => module.GetTranslation(key, args);
}
