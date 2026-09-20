using HomeBook.Frontend.Modules.Abstractions;
using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.Module.Finances.Widgets;

public partial class CurrentBudgetWidget : WidgetBase, IWidget
{
    public static WidgetSize[] AvailableSizes { get; } =
    [
        WidgetSize.Size4x2,
        WidgetSize.Size8x4
    ];
}
