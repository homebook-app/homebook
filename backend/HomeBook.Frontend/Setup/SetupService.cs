using System.Net;
using HomeBook.Client;
using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Abstractions.Enums;
using HomeBook.Frontend.Setup.SetupSteps;
using Microsoft.Kiota.Abstractions;

namespace HomeBook.Frontend.Setup;

public class SetupService(BackendClient backendClient) : ISetupService
{
    public Guid Id { get; } = Guid.NewGuid();
    private Dictionary<string, object> _storage = new();
    private List<ISetupStep> _setupSteps = [];
    public Func<Task>? OnSetupSuccessful { get; set; }
    public Func<ISetupStep, Task>? OnStepSuccessful { get; set; }
    public Func<ISetupStep, bool, Task>? OnStepFailed { get; set; }
    public Func<Task>? OnSetupStepsInitialized { get; set; }

    public async Task InitializeAsync(CancellationToken cancellationToken)
    {
        List<ISetupStep> setupSteps = [];

        AppStatus? instanceStatus = await GetInstanceStatusAsync(cancellationToken);

        // homebook is running, no setup or update required
        if (instanceStatus == AppStatus.Running)
            return;

        // setup is already running, cannot be started again
        if (instanceStatus == AppStatus.ErrorSetupRunning)
            return;

        // ONLY ON FIRST SETUP
        if (instanceStatus == AppStatus.SetupRequired)
        {
            setupSteps.Add(new BackendConnectionSetupStep());
            setupSteps.Add(new LicenseAgreementSetupStep());
            setupSteps.Add(new DatabaseConfigurationSetupStep());
            setupSteps.Add(new AdminUserSetupStep());
            setupSteps.Add(new ConfigurationSetupStep());
            setupSteps.Add(new SetupProcessSetupStep());
        }

        // ONLY ON UPDATE
        if (instanceStatus == AppStatus.UpdateRequired)
        {
            setupSteps.Add(new BackendConnectionSetupStep());
            setupSteps.Add(new UpdateProcessSetupStep());
        }

        _setupSteps = setupSteps;
    }

    public async Task TriggerOnMudStepInitialized(CancellationToken cancellationToken)
    {
        if (OnSetupStepsInitialized is not null)
            await OnSetupStepsInitialized.Invoke();
    }

    public async Task<ISetupStep[]> GetSetupStepsAsync(CancellationToken cancellationToken)
    {
        await Task.CompletedTask;

        return _setupSteps.ToArray();
    }

    public async Task<ISetupStep?> GetActiveSetupStepAsync(CancellationToken cancellationToken)
    {
        await Task.CompletedTask;

        ISetupStep? activeStep = _setupSteps.FirstOrDefault(step => !step.IsSuccessful);

        return activeStep;
    }

    public async Task<int> GetSetupAvailabilityAsync(CancellationToken cancellationToken)
    {
        NativeResponseHandler native = new();
        await backendClient.Setup.Availability.GetAsync(cfg =>
            {
                cfg.Options.Add(new ResponseHandlerOption
                {
                    ResponseHandler = native
                });
            },
            cancellationToken);
        HttpStatusCode? status = (native.Value as HttpResponseMessage)?.StatusCode;
        return (int)(status ?? HttpStatusCode.InternalServerError);
    }

    public async Task<AppStatus?> GetInstanceStatusAsync(CancellationToken cancellationToken)
    {
        try
        {
            HttpStatusCode status = (HttpStatusCode)await GetSetupAvailabilityAsync(cancellationToken);

            return status switch
            {
                // setup can be started
                HttpStatusCode.OK => AppStatus.SetupRequired,
                // setup is done, but an update is required
                HttpStatusCode.Created => AppStatus.UpdateRequired,
                // setup is finished and no update is required => Homebook is ready to use
                HttpStatusCode.NoContent => AppStatus.Running,
                // setup is not available (already running)
                HttpStatusCode.Conflict => AppStatus.ErrorSetupRunning,
                _ => null // unknown error
            };
        }
        catch (ApiException)
        {
            // TODO: handle error or log error
            // unknown error
            return null;
        }
    }

    public async Task SetStepStatusAsync(bool success,
        bool hasError,
        CancellationToken cancellationToken)
    {
        ISetupStep? activeStep = await GetActiveSetupStepAsync(cancellationToken);
        if (activeStep is null)
            throw new InvalidOperationException("No active setup step found.");

        if (hasError)
        {
            // set as failed
            activeStep.HasError = true;

            if (OnStepFailed != null)
                await OnStepFailed.Invoke(activeStep, true);
            return;
        }

        // reset failed status
        activeStep.HasError = false;
        if (OnStepFailed != null)
            await OnStepFailed.Invoke(activeStep, false);

        if (success)
        {
            // set as successful
            activeStep.IsSuccessful = true;
            if (OnStepSuccessful != null)
                await OnStepSuccessful.Invoke(activeStep);
        }
    }

    public Task SetStorageValueAsync(string key,
        object value,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Key cannot be null or whitespace.", nameof(key));

        _storage[key] = value;
        return Task.CompletedTask;
    }

    public Task<T?> GetStorageValueAsync<T>(string key,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Key cannot be null or whitespace.", nameof(key));

        if (_storage.TryGetValue(key, out object? value) && value is T typedValue)
            return Task.FromResult(typedValue)!;

        return Task.FromResult<T?>(default);
    }

    public async Task TriggerSetupFinishedAsync(CancellationToken cancellationToken)
    {
        if (OnSetupSuccessful != null)
            await OnSetupSuccessful.Invoke();
    }
}
