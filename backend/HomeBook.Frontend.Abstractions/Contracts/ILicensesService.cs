using HomeBook.Frontend.Abstractions.Models;

namespace HomeBook.Frontend.Abstractions.Contracts;

/// <summary>
/// defines methods to interact with licenses017631541325
/// </summary>
public interface ILicensesService
{
    /// <summary>
    /// returns all licenses in the current version of HomeBook
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<License[]> GetAllLicensesAsync(CancellationToken cancellationToken);

    /// <summary>
    /// if true the licenses are accepted
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<bool> AreLicensesAcceptedAsync(CancellationToken cancellationToken);
}
