using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Abstractions.Models.System;
using HomeBook.Frontend.Components;
using HomeBook.Frontend.Core.Models.Setup;
using HomeBook.Frontend.Mappings;
using HomeBook.Frontend.UI.Resources;
using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace HomeBook.Frontend.Pages.Settings;

public partial class About : ComponentBase
{
    private string _uiDotnetVersion = ".NET 1.0.0";
    private string _backendVersion = string.Empty;
    private string _backendDotnetVersion = ".NET 1.0.0";
    private string _databaseProvider = "";
    private string _deploymentType = "";
    private List<LicenseViewModel> _licenses = [];

    protected override async Task OnInitializedAsync()
    {
        await base.OnInitializedAsync();

        CancellationToken cancellationToken = CancellationToken.None;

        LoadUiInfoAsync();
        await LoadBackendInfoAsync(cancellationToken);
        await LoadLicensesAsync(cancellationToken);
    }

    private async Task LoadLicensesAsync(CancellationToken cancellationToken)
    {
        License[] licenses = await LicensesService.GetAllLicensesAsync(cancellationToken);
        _licenses = licenses.OrderBy(x => x.Name)
            .Select(x => x.ToViewModel())
            .ToList();
    }

    private void LoadUiInfoAsync()
    {
        _uiDotnetVersion = $".NET {Environment.Version}";
        StateHasChanged();
    }

    private async Task LoadBackendInfoAsync(CancellationToken cancellationToken)
    {
        if (!await AuthenticationService.IsCurrentUserAdminAsync(cancellationToken))
            return;

        try
        {
            SystemInfo? systemInfo = await SystemManagementProvider.GetSystemInfoAsync(cancellationToken);
            if (systemInfo is not null)
            {
                _backendVersion = systemInfo.AppVersion.ToString();
                _backendDotnetVersion = $".NET {systemInfo.DotNetVersion}";

                _databaseProvider = systemInfo.DatabaseProvider;
                _deploymentType = systemInfo.DeploymentType;
                StateHasChanged();
            }
        }
        catch (Exception err)
        {
            // display error
            Snackbar.Add(string.Format(Loc[nameof(LocalizationStrings.Settings_About_Error_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
    }

    private async Task OpenLicensesDialogAsync()
    {
        DialogParameters<UiLicenseDialog> parameters = new()
        {
            {
                x => x.Licenses, _licenses
            },
            {
                x => x.ShowAcceptButton, false
            },
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
    }
}
