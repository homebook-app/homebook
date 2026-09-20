using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Core.Models.Setup;
using Microsoft.AspNetCore.Components;
using Microsoft.Kiota.Abstractions;

namespace HomeBook.Frontend.Setup.SetupSteps;

public partial class AdminUserSetupStep : ComponentBase, ISetupStep
{
    private bool _isChecking = false;
    private bool _userIsOk = false;
    private bool _preConfigured = false;
    private string? _errorMessage = null;
    private UserConfigurationViewModel _userConfiguration = new();

    public string Key { get; } = nameof(AdminUserSetupStep);
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
            _isChecking = true;
            StateHasChanged();

            CancellationToken cancellationToken = CancellationToken.None;

            await BackendClient.Setup.User.GetAsync(x =>
                {
                },
                cancellationToken);

            // if request is successful, user is already set up
            _userIsOk = true;
            _preConfigured = true;
        }
        catch (ApiException err) when (err.ResponseStatusCode == 404)
        {
            // user not found, needs to be set up
            _userIsOk = false;
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

    private async Task OnValidSubmit()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        await SetupService.SetStorageValueAsync("HOMEBOOK_USERNAME", _userConfiguration.Username, cancellationToken);
        await SetupService.SetStorageValueAsync("HOMEBOOK_PASSWORD", _userConfiguration.Password, cancellationToken);

        _errorMessage = null;
        _userIsOk = true;
        _preConfigured = false;
        await InvokeAsync(StateHasChanged);
    }

    private async Task OnCountdownFinishedAsync()
    {
        if (!_userIsOk)
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
