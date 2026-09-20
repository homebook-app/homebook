using HomeBook.Frontend.ModuleCore;
using HomeBook.Frontend.Modules.Abstractions;

namespace HomeBook.Frontend.Options;

/// <summary>
/// options for HomeBookBuilder
/// </summary>
public class HomeBookOptions
{
    public IStartMenuBuilder StartMenuBuilder { get; set; } = new StartMenuBuilder();
}
