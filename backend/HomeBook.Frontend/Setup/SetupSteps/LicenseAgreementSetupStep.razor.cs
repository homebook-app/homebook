using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Components;
using HomeBook.Frontend.Core.Models.Setup;
using HomeBook.Frontend.Mappings;
using HomeBook.Frontend.UI.Resources;
using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace HomeBook.Frontend.Setup.SetupSteps;

public partial class LicenseAgreementSetupStep : ComponentBase, ISetupStep
{
    private bool _isLoading = false;
    private string? _errorMessage = null;
    private List<LicenseViewModel> _licenses = [];
    private bool _licensesAccepted = false;

    public string Key { get; } = nameof(LicenseAgreementSetupStep);
    public bool HasError { get; set; }
    public bool IsSuccessful { get; set; }
    public Task HandleStepAsync() => throw new NotImplementedException();

    public Task<bool> IsStepDoneAsync(CancellationToken cancellationToken) => throw new NotImplementedException();

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!firstRender)
            return;

        await LoadLicensesAsync();
    }

    private async Task LoadLicensesAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        _isLoading = true;
        _errorMessage = null;
        await InvokeAsync(StateHasChanged);

        try
        {
            License[] licenses = await LicensesService.GetAllLicensesAsync(cancellationToken);
            _licenses = licenses.OrderBy(x => x.Name)
                .Select(x => x.ToViewModel())
                .ToList();
            _licensesAccepted = await LicensesService.AreLicensesAcceptedAsync(cancellationToken);
            await InvokeAsync(StateHasChanged);
        }
        catch (Exception err)
        {
            _errorMessage = string.Format(Loc[nameof(LocalizationStrings.Setup_Licenses_LoadingError_MessageTemplate)],
                err.Message);
            await StepErrorAsync(cancellationToken);
        }
        finally
        {
            _isLoading = false;
            await InvokeAsync(StateHasChanged);
        }

        if (_licensesAccepted)
        {
            // wait and go to next step
            await SetupService.SetStorageValueAsync("HOMEBOOK_LICENSES_ACCEPTED", true, cancellationToken);
            await SetupService.SetStepStatusAsync(false, false, cancellationToken);
            await InvokeAsync(StateHasChanged);
        }
    }

    private async Task StepErrorAsync(CancellationToken cancellationToken = default)
    {
        await SetupService.SetStepStatusAsync(false, true, cancellationToken);
    }

    private async Task StepSuccessAsync(CancellationToken cancellationToken = default)
    {
        await SetupService.SetStepStatusAsync(true, false, cancellationToken);
    }

    private async Task OpenLicensesDialogAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        DialogParameters<UiLicenseDialog> parameters = new()
        {
            {
                x => x.Licenses, _licenses
            }
        };

        IDialogReference licenseDialog = await DialogService.ShowAsync<UiLicenseDialog>(string.Empty,
            parameters,
            new DialogOptions()
            {
                MaxWidth = MaxWidth.Medium,
                FullWidth = true,
            });

        DialogResult? licenseDialogResult = await licenseDialog.Result;
        if (licenseDialogResult is null
            || licenseDialogResult.Canceled)
            return;

        // license is accepted
        await AcceptLicensesAsync();
        await StepSuccessAsync(cancellationToken);
    }

    private async Task OnCountdownFinishedAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        await StepSuccessAsync(cancellationToken);
        await InvokeAsync(StateHasChanged);
    }

    private async Task AcceptLicensesAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        await SetupService.SetStorageValueAsync("HOMEBOOK_LICENSES_ACCEPTED", true, cancellationToken);

        await StepSuccessAsync(cancellationToken);
        await InvokeAsync(StateHasChanged);
    }
}
