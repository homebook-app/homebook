using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.UI.Components;

public partial class UiColoredIcon : ComponentBase
{
    [Parameter]
    public string? Icon { get; set; }

    [Parameter]
    public string? Color { get; set; }
}
