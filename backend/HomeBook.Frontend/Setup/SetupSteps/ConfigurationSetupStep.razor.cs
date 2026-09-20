using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Core.Models.Configuration;
using HomeBook.Frontend.Core.Models.Setup;
using HomeBook.Frontend.Mappings;
using Microsoft.AspNetCore.Components;
using Microsoft.Kiota.Abstractions;

namespace HomeBook.Frontend.Setup.SetupSteps;

public partial class ConfigurationSetupStep : ComponentBase, ISetupStep
{
    private bool _isChecking = false;
    private bool _configurationIsOk = false;
    private bool _preConfigured = false;
    private string? _errorMessage = null;
    private HomebookConfigurationViewModel _homebookConfiguration = new();

    private readonly List<LanguageViewModel> _availableLanguages = [];

    public string Key { get; } = nameof(ConfigurationSetupStep);
    public bool HasError { get; set; }
    public bool IsSuccessful { get; set; }
    public Task HandleStepAsync() => throw new NotImplementedException();

    public Task<bool> IsStepDoneAsync(CancellationToken cancellationToken) => throw new NotImplementedException();

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!firstRender)
            return;

        try
        {
            // set default
            _homebookConfiguration.InstanceName = "My HomeBook";

            _isChecking = true;
            StateHasChanged();

            CancellationToken cancellationToken = CancellationToken.None;

            await LoadAvailableLocalesAsync(cancellationToken);

            await BackendClient.Setup.Configuration.GetAsync(x =>
                {
                },
                cancellationToken);

            // if request is successful, user is already set up
            _configurationIsOk = true;
            _preConfigured = true;
        }
        catch (ApiException err) when (err.ResponseStatusCode == 404)
        {
            // user not found, needs to be set up
            _configurationIsOk = false;
            _preConfigured = false;
        }
        catch (Exception err)
        {
            _errorMessage = err.Message;
        }
        finally
        {
            _isChecking = false;
            StateHasChanged();
        }
    }

    private async Task LoadAvailableLocalesAsync(CancellationToken cancellationToken)
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

            StateHasChanged();
        }
    }

    private async Task OnValidSubmit()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        await SetupService.SetStorageValueAsync("HOMEBOOK_CONFIGURATION_NAME",
            _homebookConfiguration.InstanceName,
            cancellationToken);
        await SetupService.SetStorageValueAsync("HOMEBOOK_CONFIGURATION_DEFAULT_LOCALE",
            _homebookConfiguration.InstanceDefaultLocale,
            cancellationToken);

        _errorMessage = null;
        _configurationIsOk = true;
        _preConfigured = false;
        await InvokeAsync(StateHasChanged);
    }

    private async Task OnCountdownFinishedAsync()
    {
        if (!_configurationIsOk)
            return;

        CancellationToken cancellationToken = CancellationToken.None;

        await StepSuccessAsync(cancellationToken);
        await InvokeAsync(StateHasChanged);
    }

    private async Task StepErrorAsync(CancellationToken cancellationToken = default)
    {
        await SetupService.SetStepStatusAsync(false, true, cancellationToken);
    }

    private async Task StepSuccessAsync(CancellationToken cancellationToken = default)
    {
        await SetupService.SetStepStatusAsync(true, false, cancellationToken);
    }
}
