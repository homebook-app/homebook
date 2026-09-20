using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace HomeBook.Frontend.UI.Components;

public partial class UiProgressItem : ComponentBase
{
    [Parameter]
    public string? HeaderTextStart { get; set; }

    [Parameter]
    public Typo HeaderTextStartTypo { get; set; } = Typo.caption;

    [Parameter]
    public string? HeaderTextEnd { get; set; }

    [Parameter]
    public Typo HeaderTextEndTypo { get; set; } = Typo.caption;

    [Parameter]
    public string? FooterTextStart { get; set; }

    [Parameter]
    public Typo FooterTextStartTypo { get; set; } = Typo.caption;

    [Parameter]
    public string? FooterTextEnd { get; set; }

    [Parameter]
    public Typo FooterTextEndTypo { get; set; } = Typo.caption;

    [Parameter]
    public double ProgressValue { get; set; } = 0;

    [Parameter]
    public Size ProgressSize { get; set; } = Size.Medium;

    [Parameter]
    public string? Color { get; set; }
}
