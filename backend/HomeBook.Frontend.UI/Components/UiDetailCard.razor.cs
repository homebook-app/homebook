using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.UI.Components;

public partial class UiDetailCard : ComponentBase
{
    [Parameter]
    public RenderFragment? HeaderContent { get; set; }

    [Parameter]
    public string? Color { get; set; }

    [Parameter]
    public string? Icon { get; set; }

    [Parameter]
    public RenderFragment? FooterContent { get; set; }
}
