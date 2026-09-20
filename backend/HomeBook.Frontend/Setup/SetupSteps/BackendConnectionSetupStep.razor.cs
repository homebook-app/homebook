using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Setup.Exceptions;
using HomeBook.Frontend.UI.Resources;
using Microsoft.AspNetCore.Components;
using Microsoft.Kiota.Abstractions;

namespace HomeBook.Frontend.Setup.SetupSteps;

public partial class BackendConnectionSetupStep : ComponentBase, ISetupStep
{
    private bool _isChecking = false;
    private bool _serverIsOk = false;
    private string? _errorMessage = null;

    public string Key { get; } = nameof(BackendConnectionSetupStep);
    public bool HasError { get; set; }
    public bool IsSuccessful { get; set; }
    public Task HandleStepAsync() => throw new NotImplementedException();

    public Task<bool> IsStepDoneAsync(CancellationToken cancellationToken) => throw new NotImplementedException();

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!firstRender)
            return;

        await StartAsync();
    }

    private async Task StartAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        _isChecking = true;
        _serverIsOk = false;
        _errorMessage = null;
        await InvokeAsync(StateHasChanged);

        try
        {
            await Task.WhenAll(
                Task.Delay(2000, cancellationToken),
                ConnectToServerAsync(cancellationToken));

            _serverIsOk = true;
            StateHasChanged();
            await SetupService.SetStepStatusAsync(false, false, cancellationToken);
        }
        catch (HttpRequestException)
        {
            _errorMessage = Loc[nameof(LocalizationStrings.Setup_BackendConnectionFailed_Message)];
            await StepErrorAsync(cancellationToken);
        }
        catch (SetupCheckException err)
        {
            _errorMessage = err.Message;
            await StepErrorAsync(cancellationToken);
        }
        catch (Exception err)
        {
            _errorMessage = string.Format(
                Loc[nameof(LocalizationStrings.Setup_BackendConnection_CheckError_MessageTemplate)],
                err.Message);
            await StepErrorAsync(cancellationToken);
        }
        finally
        {
            _isChecking = false;
            await InvokeAsync(StateHasChanged);
        }
    }

    private async Task ConnectToServerAsync(CancellationToken cancellationToken)
    {
        var versionResponse = await BackendClient
            .Version
            .GetAsync((x) =>
                {
                },
                cancellationToken);

        if (string.IsNullOrEmpty(versionResponse))
            throw new SetupCheckException(
                Loc[nameof(LocalizationStrings.Setup_BackendConnection_Check_VersionError_Message)]);

        try
        {
            await BackendClient.Setup.Availability.GetAsync(x =>
                {
                },
                cancellationToken
            );
        }
        catch (ApiException err) when (err.ResponseStatusCode == 409)
        {
            throw new SetupCheckException(
                Loc[nameof(LocalizationStrings.Setup_BackendConnection_Check_SetupInProgressError_Message)]);
        }
        catch (ApiException err) when (err.ResponseStatusCode == 500)
        {
            throw new SetupCheckException(
                Loc[nameof(LocalizationStrings.Setup_BackendConnection_Check_UnknownError_Message)]);
        }
        catch (Exception err)
        {
            throw new SetupCheckException(string.Format(
                Loc[nameof(LocalizationStrings.Setup_BackendConnection_Check_UnknownError_MessageTemplate)],
                err.Message));
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

    private async Task OnCountdownFinishedAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;
        if (_serverIsOk)
        {
            await StepSuccessAsync(cancellationToken);
            await InvokeAsync(StateHasChanged);
        }
    }
}
