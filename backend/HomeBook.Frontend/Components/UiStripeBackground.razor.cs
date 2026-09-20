using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace HomeBook.Frontend.Components;

public partial class UiStripeBackground : ComponentBase, IAsyncDisposable
{
    [Inject]
    private IJSRuntime JSRuntime { get; set; } = null!;

    [Parameter]
    public string CanvasCssClass { get; set; } = string.Empty;

    private IJSObjectReference? _jsModule;
    private IJSObjectReference? _gradientInstance;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await InitializeGradientAsync();
        }
    }

    private async Task InitializeGradientAsync()
    {
        try
        {
            // JavaScript-Modul laden
            _jsModule = await JSRuntime.InvokeAsync<IJSObjectReference>("import",
                "./Components/UiStripeBackground.razor.js");

            // UiStripeBackground-Instanz mit Helper-Funktion erstellen
            _gradientInstance = await _jsModule.InvokeAsync<IJSObjectReference>("createUiStripeBackground");

            // Gradient mit Canvas-Selektor initialisieren
            await _gradientInstance.InvokeVoidAsync("init", "#ui-stripe-background-canvas");
        }
        catch (Exception ex)
        {
            Logger.LogError($"Error initializing gradient: {ex.Message}");
        }
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            if (_gradientInstance != null)
            {
                await _gradientInstance.InvokeVoidAsync("disconnect");
                await _gradientInstance.DisposeAsync();
            }

            if (_jsModule != null)
            {
                await _jsModule.DisposeAsync();
            }
        }
        catch (Exception ex)
        {
            Logger.LogError($"Error disposing gradient: {ex.Message}");
        }
    }
}
