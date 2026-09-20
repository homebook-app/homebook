using HomeBook.Frontend.Abstractions.Enums;

namespace HomeBook.Frontend.Abstractions.Contracts;

public interface ISetupService
{
    Func<Task>? OnSetupSuccessful { get; set; }
    Func<ISetupStep, Task>? OnStepSuccessful { get; set; }
    Func<ISetupStep, bool, Task>? OnStepFailed { get; set; }
    Func<Task>? OnSetupStepsInitialized { get; set; }

    /// <summary>
    /// initialize the setup service (load setup steps, etc.)
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task InitializeAsync(CancellationToken cancellationToken);

    /// <summary>
    /// triggers by ui component which handles the MudStepper component
    /// to notify the service that the MudStep component is initialized.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task TriggerOnMudStepInitialized(CancellationToken cancellationToken);

    Task<ISetupStep[]> GetSetupStepsAsync(CancellationToken cancellationToken);

    Task<ISetupStep?> GetActiveSetupStepAsync(CancellationToken cancellationToken);

    /// <summary>
    /// returns the status code of the setup availability.
    /// 200: Setup is not executed yet and available => Setup can be started
    /// 201: Setup is finished, but an update is required => Update must be executed before Homebook can be used
    /// 204: Setup is finished and no update is required => Homebook is ready to use
    /// 500: Unknown error while setup checking
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<int> GetSetupAvailabilityAsync(CancellationToken cancellationToken);

    /// <summary>
    /// returns true if the setup is done, otherwise false.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<AppStatus?> GetInstanceStatusAsync(CancellationToken cancellationToken);

    /// <summary>
    /// set the status of the current step.
    /// </summary>
    /// <param name="success"></param>
    /// <param name="hasError"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task SetStepStatusAsync(bool success, bool hasError, CancellationToken cancellationToken);

    /// <summary>
    /// stores a setup value by the given key.
    /// </summary>
    /// <param name="key"></param>
    /// <param name="value"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task SetStorageValueAsync(string key, object value, CancellationToken cancellationToken);

    /// <summary>
    /// returns a setup value by the given key.
    /// </summary>
    /// <param name="key"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<T?> GetStorageValueAsync<T>(string key, CancellationToken cancellationToken);

    /// <summary>
    /// trigger the setup finished event.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task TriggerSetupFinishedAsync(CancellationToken cancellationToken);
}
