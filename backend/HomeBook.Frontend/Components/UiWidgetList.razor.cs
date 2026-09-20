using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.Components;

public partial class UiWidgetList : ComponentBase
{
    [Parameter]
    public string CanvasCssClass { get; set; } = string.Empty;

    [Parameter]
    public RenderFragment? ChildContent { get; set; }
}
