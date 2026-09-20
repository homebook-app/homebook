using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Setup.Exceptions;
using HomeBook.Frontend.UI.Resources;
using Microsoft.AspNetCore.Components;
using Microsoft.Kiota.Abstractions;

namespace HomeBook.Frontend.Setup.SetupSteps;

public partial class UpdateProcessSetupStep : ComponentBase, ISetupStep
{
    private bool _updateIsRunning = false;
    private bool _updateSuccessful = false;
    private bool _updateFailed = false;
    private string? _errorMessage = null;

    public string Key { get; } = nameof(UpdateProcessSetupStep);
    public bool HasError { get; set; }
    public bool IsSuccessful { get; set; }
    public Task HandleStepAsync() => throw new NotImplementedException();
    public Task<bool> IsStepDoneAsync(CancellationToken cancellationToken) => throw new NotImplementedException();

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!firstRender)
            return;
    }

    private async Task StartUpdateAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        _updateIsRunning = true;
        _updateSuccessful = false;
        _updateFailed = false;
        _errorMessage = null;
        await InvokeAsync(StateHasChanged);

        try
        {
            await StartUpdateAsync(cancellationToken);

            _updateSuccessful = true;
            await SetupService.SetStepStatusAsync(false, false, cancellationToken);
        }
        catch (HttpRequestException)
        {
            _updateFailed = true;
            _errorMessage = Loc[nameof(LocalizationStrings.Setup_BackendConnectionFailed_Message)];
            await StepErrorAsync(cancellationToken);
        }
        catch (SetupCheckException err)
        {
            _updateFailed = true;
            _errorMessage = err.Message;
            await StepErrorAsync(cancellationToken);
        }
        catch (Exception err)
        {
            _updateFailed = true;
            _errorMessage = string.Format(
                Loc[nameof(LocalizationStrings.Update_Process_ProcessingError_MessageTemplate)],
                err.Message);
            await StepErrorAsync(cancellationToken);
        }
        finally
        {
            _updateIsRunning = false;
            await InvokeAsync(StateHasChanged);
        }
    }

    private async Task StartUpdateAsync(CancellationToken cancellationToken)
    {
        try
        {
            // 1. start update (it will restart the server at the end of the update process)
            await BackendClient.Update.Start.PostAsync(x =>
                {
                },
                cancellationToken);

            // 2. wait for min 10 seconds to give the server time to restart
            await Task.Delay(10000, cancellationToken);

            // 3. wait until the server is available again and check that the status is correct
            bool isUpdateDone = await WaitForServerRestartAndGetStatusAsync(cancellationToken);
            if (!isUpdateDone)
                throw new SetupCheckException(
                    Loc[nameof(LocalizationStrings.Update_Process_ProcessingServerRestartError_Message)]);

            // otherwise the update was successful
        }
        catch (ApiException err) when (err.ResponseStatusCode == 409)
        {
            throw new SetupCheckException(
                Loc[nameof(LocalizationStrings.Update_Process_ProcessingSetupMissingError_Message)]);
        }
        catch (ApiException err) when (err.ResponseStatusCode == 500)
        {
            throw new SetupCheckException(
                Loc[nameof(LocalizationStrings.Update_Process_ProcessingUnknownError_Message)]);
        }
        catch (Exception err)
        {
            throw new SetupCheckException(
                string.Format(Loc[nameof(LocalizationStrings.Update_Process_ProcessingUnknownError_MessageTemplate)],
                    err.Message));
        }
    }

    private async Task<bool> WaitForServerRestartAndGetStatusAsync(CancellationToken cancellationToken)
    {
        int maxTimeToWaitInSeconds = (5 * 60); // 5 minutes
        int timeToWaitBetweenRequestsInSeconds = 5; // 3 seconds
        int maxRetries = maxTimeToWaitInSeconds / timeToWaitBetweenRequestsInSeconds;

        for (int i = 0; i < maxRetries; i++)
        {
            try
            {
                // check if the server is available
                int status = await SetupService.GetSetupAvailabilityAsync(cancellationToken);
                if (status == 201
                    || status == 204)
                {
                    // server is available and update is done
                    return true;
                }
            }
            catch
            {
                // ignore exceptions and wait for the next retry
            }

            // wait before the next retry
            await Task.Delay((timeToWaitBetweenRequestsInSeconds * 1000), cancellationToken);
        }

        return false;
    }

    private async Task StepErrorAsync(CancellationToken cancellationToken = default)
    {
        await SetupService.SetStepStatusAsync(false, true, cancellationToken);
    }

    private async Task StepSuccessAsync(CancellationToken cancellationToken = default)
    {
        await SetupService.SetStepStatusAsync(true, false, cancellationToken);
    }

    private async Task OnStartUpdateCountdownFinishedAsync()
    {
        // start update process
        await StartUpdateAsync();
    }

    private async Task OnCountdownFinishedAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;
        if (_updateSuccessful)
        {
            await StepSuccessAsync(cancellationToken);
            await InvokeAsync(StateHasChanged);
        }
    }

    private async Task OnStartHomeBookAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;
        await SetupService.TriggerSetupFinishedAsync(cancellationToken);
    }
}
