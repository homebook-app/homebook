using HomeBook.Frontend.Core.Models.Setup;
using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace HomeBook.Frontend.Components;

public partial class UiLicenseDialog : ComponentBase
{
    [CascadingParameter]
    private IMudDialogInstance MudDialog { get; set; } = null!;

    [Parameter]
    public EventCallback OnCanceled { get; set; }

    [Parameter]
    public EventCallback OnAccepted { get; set; }

    [Parameter]
    public List<LicenseViewModel> Licenses { get; set; } = [];

    [Parameter]
    public bool ShowAcceptButton { get; set; } = true;

    private async Task CancelAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        if (OnCanceled.HasDelegate)
            await OnCanceled.InvokeAsync(cancellationToken);

        MudDialog.Cancel();
    }

    private async Task AcceptLicensesAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        if (OnAccepted.HasDelegate)
            await OnAccepted.InvokeAsync(cancellationToken);

        MudDialog.Close(DialogResult.Ok(true));
    }
}
