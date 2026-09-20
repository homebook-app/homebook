using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.Modules.Abstractions;

public abstract class WidgetBase : ComponentBase
{
    protected bool IsBusy = false;

    [Parameter]
    public bool IsPreview { get; set; } = true;

    [Parameter]
    public WidgetSize WidgetSize { get; set; } = WidgetSize.Size2x1;
}
