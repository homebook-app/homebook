using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.Components;

public partial class UiStartMenuItem : ComponentBase
{
    [Parameter]
    public string? Title { get; set; }

    [Parameter]
    public string? Caption { get; set; }

    [Parameter]
    public string? Url { get; set; }

    [Parameter]
    public string? Icon { get; set; }

    [Parameter]
    public string? Color { get; set; }
}
