using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.UI.Components;

public partial class UiValueCard : ComponentBase
{
    [Parameter]
    public string? Title { get; set; }

    [Parameter]
    public string? ValueDisplay { get; set; }

    [Parameter]
    public string? Color { get; set; }

    [Parameter]
    public string? Icon { get; set; }

    [Parameter]
    public string? FooterHighlightedText { get; set; }

    [Parameter]
    public string? FooterNotice { get; set; }
}
