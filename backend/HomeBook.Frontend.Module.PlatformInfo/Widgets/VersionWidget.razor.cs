using HomeBook.Frontend.Modules.Abstractions;
using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.Module.PlatformInfo.Widgets;

public partial class VersionWidget : WidgetBase, IWidget
{
    private string _version = string.Empty;

    public static WidgetSize[] AvailableSizes { get; } =
    [
        WidgetSize.Size2x1
    ];

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!firstRender)
            return;

        try
        {
            IsBusy = true;
            StateHasChanged();

            await LoadAsync();
        }
        catch (Exception)
        {
        }
        finally
        {
            IsBusy = false;
            StateHasChanged();
        }
    }

    private async Task LoadAsync()
    {
        if (IsPreview)
        {
            await Task.Delay(5000);

            _version = "1.0.0";

            return;
        }

        await LoadVersionAsync();
    }

    private async Task LoadVersionAsync()
    {
        await Task.CompletedTask;
        _version = Configuration["Version"] ?? "-";
    }
}
