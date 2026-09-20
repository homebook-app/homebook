using System.Globalization;

namespace HomeBook.Frontend.Abstractions.Contracts;

/// <summary>
/// defines localization service
/// </summary>
public interface ILocalizationService
{
    /// <summary>
    /// initializes localization service
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task InitializeAsync(CancellationToken cancellationToken);

    /// <summary>
    ///
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<string> GetCultureAsync(CancellationToken cancellationToken = default);

    /// <summary>
    ///
    /// </summary>
    /// <param name="selectedCulture"></param>
    /// <param name="forceLoad"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task SetCultureAsync(string selectedCulture,
        bool forceLoad = true,
        CancellationToken cancellationToken = default);
}
