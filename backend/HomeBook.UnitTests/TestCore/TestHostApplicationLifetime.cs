using Microsoft.Extensions.Hosting;

namespace HomeBook.UnitTests.TestCore;

public class TestHostApplicationLifetime : IHostApplicationLifetime
{
    private readonly CancellationTokenSource _applicationStartedSource = new();
    private readonly CancellationTokenSource _applicationStoppingSource = new();
    private readonly CancellationTokenSource _applicationStoppedSource = new();

    public CancellationToken ApplicationStarted => _applicationStartedSource.Token;
    public CancellationToken ApplicationStopping => _applicationStoppingSource.Token;
    public CancellationToken ApplicationStopped => _applicationStoppedSource.Token;

    // Events for observing application lifecycle changes
    public event EventHandler? ApplicationStartedTriggered;
    public event EventHandler? ApplicationStoppingTriggered;
    public event EventHandler? ApplicationStoppedTriggered;

    // Properties to track the current state
    public bool IsApplicationStarted { get; private set; }
    public bool IsApplicationStopping { get; private set; }
    public bool IsApplicationStopped { get; private set; }

    public void StopApplication()
    {
        if (!IsApplicationStopping && !IsApplicationStopped)
        {
            IsApplicationStopping = true;
            ApplicationStoppingTriggered?.Invoke(this, EventArgs.Empty);
            _applicationStoppingSource.Cancel();

            // Simulate the stopping process completing
            IsApplicationStopped = true;
            ApplicationStoppedTriggered?.Invoke(this, EventArgs.Empty);
            _applicationStoppedSource.Cancel();
        }
    }

    /// <summary>
    /// Simulates the application startup process (for testing purposes)
    /// </summary>
    public void SimulateApplicationStarted()
    {
        if (!IsApplicationStarted)
        {
            IsApplicationStarted = true;
            ApplicationStartedTriggered?.Invoke(this, EventArgs.Empty);
            _applicationStartedSource.Cancel();
        }
    }

    /// <summary>
    /// Resets the application lifecycle state (for testing purposes)
    /// </summary>
    public void Reset()
    {
        IsApplicationStarted = false;
        IsApplicationStopping = false;
        IsApplicationStopped = false;
    }
}
