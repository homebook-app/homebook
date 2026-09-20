using HomeBook.Frontend.Abstractions.Models.System;

namespace HomeBook.Frontend.Abstractions.Contracts;

/// <summary>
/// defines methods to manage the system
/// </summary>
public interface ISystemManagementProvider
{
    /// <summary>
    /// returns system information of the backend service
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<SystemInfo?> GetSystemInfoAsync(CancellationToken cancellationToken = default);
}
