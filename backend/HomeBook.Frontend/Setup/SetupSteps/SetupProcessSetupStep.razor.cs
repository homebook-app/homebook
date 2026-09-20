using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Setup.Exceptions;
using HomeBook.Frontend.UI.Resources;
using Microsoft.AspNetCore.Components;
using Microsoft.Kiota.Abstractions;

namespace HomeBook.Frontend.Setup.SetupSteps;

public partial class SetupProcessSetupStep : ComponentBase, ISetupStep
{
    private bool _setupIsRunning = false;
    private bool _setupSuccessful = false;
    private bool _setupFailed = false;
    private string? _errorMessage = null;

    public string Key { get; } = nameof(SetupProcessSetupStep);
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

    private async Task StartSetupAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        _setupIsRunning = true;
        _setupSuccessful = false;
        _setupFailed = false;
        _errorMessage = null;
        await InvokeAsync(StateHasChanged);

        try
        {
            await StartSetupAsync(cancellationToken);

            _setupSuccessful = true;
            await SetupService.SetStepStatusAsync(false, false, cancellationToken);
        }
        catch (HttpRequestException)
        {
            _setupFailed = true;
            _errorMessage = Loc[nameof(LocalizationStrings.Setup_BackendConnectionFailed_Message)];
            await StepErrorAsync(cancellationToken);
        }
        catch (SetupCheckException err)
        {
            _setupFailed = true;
            _errorMessage = err.Message;
            await StepErrorAsync(cancellationToken);
        }
        catch (Exception err)
        {
            _setupFailed = true;
            _errorMessage = string.Format(
                Loc[nameof(LocalizationStrings.Setup_Process_ProcessingError_MessageTemplate)],
                err.Message);
            await StepErrorAsync(cancellationToken);
        }
        finally
        {
            _setupIsRunning = false;
            await InvokeAsync(StateHasChanged);
        }
    }

    private async Task StartSetupAsync(CancellationToken cancellationToken)
    {
        try
        {
            StartSetupRequest request = new();

            string? homebookUserName = await SetupService
                .GetStorageValueAsync<string>("HOMEBOOK_USERNAME", cancellationToken);
            if (!string.IsNullOrEmpty(homebookUserName))
                request.HomebookUserName = homebookUserName;

            string? homebookUserPassword = await SetupService
                .GetStorageValueAsync<string>("HOMEBOOK_PASSWORD", cancellationToken);
            if (!string.IsNullOrEmpty(homebookUserPassword))
                request.HomebookUserPassword = homebookUserPassword;

            string? homebookConfigurationName = await SetupService
                .GetStorageValueAsync<string>("HOMEBOOK_CONFIGURATION_NAME", cancellationToken);
            if (!string.IsNullOrEmpty(homebookConfigurationName))
                request.HomebookConfigurationName = homebookConfigurationName;

            string? homebookConfigurationDefaultLocale = await SetupService
                .GetStorageValueAsync<string>("HOMEBOOK_CONFIGURATION_DEFAULT_LOCALE", cancellationToken);
            if (!string.IsNullOrEmpty(homebookConfigurationDefaultLocale))
                request.HomebookConfigurationDefaultLocale = homebookConfigurationDefaultLocale;

            string? databaseType = await SetupService
                .GetStorageValueAsync<string>("DATABASE_TYPE", cancellationToken);
            if (!string.IsNullOrEmpty(databaseType))
                request.DatabaseType = databaseType;

            string? databaseHost = await SetupService
                .GetStorageValueAsync<string>("DATABASE_HOST", cancellationToken);
            if (!string.IsNullOrEmpty(databaseHost))
                request.DatabaseHost = databaseHost;

            ushort? databasePort = await SetupService
                .GetStorageValueAsync<ushort>("DATABASE_PORT", cancellationToken);
            if (databasePort > 0)
                request.DatabasePort = databasePort;

            string? databaseName = await SetupService
                .GetStorageValueAsync<string>("DATABASE_NAME", cancellationToken);
            if (!string.IsNullOrEmpty(databaseName))
                request.DatabaseName = databaseName;

            string? databaseUsername = await SetupService
                .GetStorageValueAsync<string>("DATABASE_USERNAME", cancellationToken);
            if (!string.IsNullOrEmpty(databaseUsername))
                request.DatabaseUserName = databaseUsername;

            string? databasePassword = await SetupService
                .GetStorageValueAsync<string>("DATABASE_PASSWORD", cancellationToken);
            if (!string.IsNullOrEmpty(databasePassword))
                request.DatabaseUserPassword = databasePassword;

            bool? licensesAccepted = await SetupService
                .GetStorageValueAsync<bool>("HOMEBOOK_LICENSES_ACCEPTED", cancellationToken);
            request.LicensesAccepted = licensesAccepted;

            // 1. start setup (it will restart the server at the end of the setup process)
            await BackendClient.Setup.Start.PostAsync(request,
                x =>
                {
                },
                cancellationToken);

            // 2. wait for min 10 seconds to give the server time to restart
            await Task.Delay(10000, cancellationToken);

            // 3. wait until the server is available again and check that the status is correct
            bool isSetupDone = await WaitForServerRestartAndGetStatusAsync(cancellationToken);
            if (!isSetupDone)
                throw new SetupCheckException(
                    Loc[nameof(LocalizationStrings.Setup_Process_ProcessingServerRestartError_Message)]);

            // otherwise the setup was successful
        }
        catch (ApiException err) when (err.ResponseStatusCode == 400)
        {
            throw new SetupCheckException(
                Loc[nameof(LocalizationStrings.Setup_Process_ProcessingValidationError_Message)]);
        }
        catch (ApiException err) when (err.ResponseStatusCode == 422)
        {
            throw new SetupCheckException(
                Loc[nameof(LocalizationStrings.Setup_Process_ProcessingLicenseError_Message)]);
        }
        catch (ApiException err) when (err.ResponseStatusCode == 500)
        {
            throw new SetupCheckException(
                Loc[nameof(LocalizationStrings.Setup_Process_ProcessingUnknownError_Message)]);
        }
        catch (Exception err)
        {
            throw new SetupCheckException(
                string.Format(Loc[nameof(LocalizationStrings.Setup_Process_ProcessingUnknownError_MessageTemplate)],
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
                    // server is available and setup is done
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

    private async Task OnStartSetupCountdownFinishedAsync()
    {
        // start setup process
        await StartSetupAsync();
    }

    private async Task OnCountdownFinishedAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;
        if (_setupSuccessful)
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
