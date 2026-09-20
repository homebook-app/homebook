using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Enums;
using HomeBook.Frontend.Core.Models.Configuration;
using HomeBook.Frontend.Core.Models.Setup;
using HomeBook.Frontend.Mappings;
using HomeBook.Frontend.UI.Resources;
using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace HomeBook.Frontend.Pages.Settings.Instance;

public partial class Overview : ComponentBase
{
    private MudForm _form = new();
    private bool _isValid;
    private bool _isLoading;
    private readonly HomebookConfigurationViewModel _configurationModel = new();
    private readonly List<LanguageViewModel> _availableLanguages = [];

    protected override async Task OnInitializedAsync()
    {
        _isLoading = true;
        StateHasChanged();

        CancellationToken cancellationToken = CancellationToken.None;

        // load needed data
        await LoadAvailableLocalesAsync(cancellationToken);

        // load current configuration
        await LoadCurrentInstanceNameAsync(cancellationToken);
        await LoadCurrentInstanceDefaultLocaleAsync(cancellationToken);

        _isLoading = false;
        StateHasChanged();
    }

    private async Task LoadAvailableLocalesAsync(CancellationToken cancellationToken)
    {
        try
        {
            // TODO: move loading locales to service
            GetLocalesResponse? localeResponse = await BackendClient.Platform.Locales.GetAsync(x =>
                {
                },
                cancellationToken);

            if (localeResponse is not null)
            {
                List<LocaleResponse>? locales = localeResponse.Locales;
                _availableLanguages.Clear();
                foreach (LocaleResponse locale in (locales ?? []).OfType<LocaleResponse>())
                {
                    _availableLanguages.Add(locale.ToViewModel());
                }
            }
        }
        catch (Exception err)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_Instance_LoadPreferences_Error_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
    }

    /// <summary>
    /// Load the current instance locale
    /// </summary>
    private async Task LoadCurrentInstanceDefaultLocaleAsync(CancellationToken cancellationToken)
    {
        try
        {
            string defaultLocale = await InstanceManagementProvider.GetDefaultLocaleAsync(cancellationToken);

            _configurationModel.InstanceDefaultLocale = defaultLocale;
            StateHasChanged();
        }
        catch (Exception err)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_Instance_LoadPreferences_Error_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
    }

    /// <summary>
    /// Load the current instance name from the server
    /// </summary>
    private async Task LoadCurrentInstanceNameAsync(CancellationToken cancellationToken)
    {
        try
        {
            string instanceName = await InstanceManagementProvider.GetInstanceNameAsync(cancellationToken);

            _configurationModel.InstanceName = instanceName;
            StateHasChanged();
        }
        catch (Exception err)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_Instance_LoadPreferences_Error_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
    }

    private async Task UpdateInstanceConfigurationAsync()
    {
        if (!_isValid)
            return;

        try
        {
            _isLoading = true;

            // Validate form before proceeding
            await _form.Validate();
            if (!_form.IsValid)
                return;

            await UpdateInstanceNameAsync(_configurationModel.InstanceName);
            await UpdateInstanceDefaultLocaleAsync(_configurationModel.InstanceDefaultLocale);

            Snackbar.Add(Loc[nameof(LocalizationStrings.Settings_Instance_PreferencesUpdated_Success_Message)],
                Severity.Success);
        }
        catch (Exception err)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_Instance_PreferencesUpdated_Error_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
        finally
        {
            _isLoading = false;
        }
    }

    private async Task UpdateInstanceDefaultLocaleAsync(string defaultLocale)
    {
        string defaultLocaleValue = defaultLocale.Trim();
        CancellationToken cancellationToken = CancellationToken.None;

        await InstanceManagementProvider.UpdateDefaultLocaleAsync(defaultLocaleValue, cancellationToken);

        await JsLocalStorageProvider.SetItemAsync(JsLocalStorageKeys.HomeBookInstanceDefaultLocale,
            defaultLocaleValue,
            cancellationToken);
    }

    private async Task UpdateInstanceNameAsync(string instanceName)
    {
        string instanceNameValue = instanceName.Trim();
        CancellationToken cancellationToken = CancellationToken.None;

        await InstanceManagementProvider.UpdateInstanceNameAsync(instanceNameValue, cancellationToken);

        await JsLocalStorageProvider.SetItemAsync(JsLocalStorageKeys.HomeBookInstanceName,
            instanceNameValue,
            cancellationToken);
    }
}
