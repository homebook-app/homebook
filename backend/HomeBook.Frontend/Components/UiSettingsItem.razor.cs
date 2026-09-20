using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace HomeBook.Frontend.Components;

public partial class UiSettingsItem : ComponentBase
{
    [Parameter]
    public string Title { get; set; } = string.Empty;

    [Parameter]
    public string Caption { get; set; } = string.Empty;

    [Parameter]
    public string Icon { get; set; } = string.Empty;

    [Parameter]
    public Color IconColor { get; set; } = Color.Default;

    [Parameter]
    public string IconHexColor { get; set; } = string.Empty;

    [Parameter]
    public RenderFragment? ChildContent { get; set; }
}
