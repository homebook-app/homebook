using HomeBook.Backend.Abstractions.Models;
using Microsoft.Extensions.Configuration;

namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// defines a processor for handling setup operations
/// </summary>
public interface ISetupProcessor
{
    /// <summary>
    /// processes the setup
    /// </summary>
    /// <param name="configuration"></param>
    /// <param name="setupConfiguration"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task ProcessAsync(IConfiguration configuration,
        SetupConfiguration setupConfiguration,
        CancellationToken cancellationToken = default);
}
