using HomeBook.Frontend.Modules.Abstractions;

namespace HomeBook.Frontend.Core.Models.Widgets;

public record WidgetConfiguration(
    Type WidgetType,
    WidgetSize Size,
    Dictionary<string, object> Parameters,
    string Identifier,
    string Team)
{
    public string Identifier { get; set; } = Identifier;
}
