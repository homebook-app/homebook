namespace HomeBook.Frontend.Abstractions.Models.System;

/// <summary>
/// contains information about the system
/// </summary>
/// <param name="DotNetVersion">The .NET Version of the Backend Service</param>
/// <param name="AppVersion">The Version of the Backend Service</param>
/// <param name="DatabaseProvider">The Database Provider used by the Backend Service</param>
/// <param name="DeploymentType">The Deployment Type of the Backend Service (e.g. Docker, etc.)</param>
public record SystemInfo(string DotNetVersion,
    Version AppVersion,
    string DatabaseProvider,
    string DeploymentType);
