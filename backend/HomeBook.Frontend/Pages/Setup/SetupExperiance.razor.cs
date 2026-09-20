using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.Pages.Setup;

public partial class SetupExperiance : ComponentBase, IDisposable
{
    private string _appVersion = string.Empty;
    private string _appServer = string.Empty;
    private string _setupTiledBackgroundClass = "is-hidden";
    private string _setupContainerClass = "";
    private string _setupBackgroundClass = "";
    private string _uiStripeBackgroundClass = "build-mode-alpha";

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!firstRender)
            return;

        SetupService.OnSetupSuccessful += async () => await FinishSetupAnimationAsync();

        _appVersion = Configuration["Version"] ?? "Unknown";
        _appServer = Configuration["Backend:Host"] ?? "Unknown";

        string buildMode = "release";
        _uiStripeBackgroundClass = buildMode switch
        {
            "alpha" => "build-mode-alpha",
            "beta" => "build-mode-beta",
            "release" => "build-mode-release",
            _ => "build-mode-unknown"
        };
        StateHasChanged();
    }

    public void Dispose()
    {
        SetupService.OnSetupSuccessful -= async () => await FinishSetupAnimationAsync();
    }

    private async Task FinishSetupAnimationAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        // fade in tiled background
        _setupTiledBackgroundClass = "";
        StateHasChanged();

        // hide content
        // await Task.Delay(1000, cancellationToken);
        _setupContainerClass = "is-finished";
        StateHasChanged();

        // move tiles from center to outside
        await Task.Delay(1000, cancellationToken);
        _setupTiledBackgroundClass = "is-finished";
        StateHasChanged();

        // fade out background
        await Task.Delay(1000, cancellationToken);
        _setupBackgroundClass = "is-finished";
        StateHasChanged();

        await Task.Delay(1000, cancellationToken);

        // navigate to homebook start page
        NavigationManager.NavigateTo("/login", forceLoad: true);
    }
}
