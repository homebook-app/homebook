namespace HomeBook.Backend.Responses;

/// <summary>
///
/// </summary>
/// <param name="DotnetRuntimeVersion"></param>
/// <param name="AppVersion"></param>
/// <param name="DatabaseProvider"></param>
/// <param name="DeploymentType"></param>
public record GetSystemInfoResponse(string DotnetRuntimeVersion,
    string AppVersion,
    string DatabaseProvider,
    string DeploymentType);
