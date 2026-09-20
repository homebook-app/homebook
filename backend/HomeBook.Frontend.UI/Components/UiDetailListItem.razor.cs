using HomeBook.Frontend.UI.Utilities;
using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace HomeBook.Frontend.UI.Components;

public partial class UiDetailListItem : ComponentBase
{
    protected string ContainerCss =>
        new HtmlArgumentBuilder("mud-list-item mud-list-item-gutters")
            .AddClass("ui-detail-list-item")
            .AddClass("mud-list-item-clickable")
            .AddClass("mud-ripple")
            .AddClass("d-flex gap-5")
            .AddClass(Class)
            .Build();

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public string? Icon { get; set; }

    [Parameter]
    public Size IconSize { get; set; } = Size.Medium;

    [Parameter]
    public RenderFragment? UiDetailListItemTitle { get; set; }

    [Parameter]
    public RenderFragment? UiDetailListItemCaption { get; set; }
}
