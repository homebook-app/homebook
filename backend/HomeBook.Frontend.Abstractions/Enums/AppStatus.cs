namespace HomeBook.Frontend.Abstractions.Enums;

public enum AppStatus
{
    Initializing, // only if the applications starts and before getting the instance-status from the server
    Error,
    Running,
    SetupRequired,
    ErrorSetupRunning,
    UpdateRequired,
}
