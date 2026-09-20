using HomeBook.Client;
using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Services.Extensions;
using Microsoft.Kiota.Abstractions;

namespace HomeBook.Frontend.Services.Services;

/// <inheritdoc />
public class LicensesService(BackendClient backendClient) : ILicensesService
{
    private List<License>? _cachedLicenses = null;
    private bool? _licensesAccepted = false;

    /// <inheritdoc />
    public async Task<License[]> GetAllLicensesAsync(CancellationToken cancellationToken)
    {
        if (_cachedLicenses is null)
            await LoadLicensesAsync(cancellationToken);

        return _cachedLicenses!.ToArray();
    }

    /// <inheritdoc />
    public async Task<bool> AreLicensesAcceptedAsync(CancellationToken cancellationToken)
    {
        if (_cachedLicenses is null)
            await LoadLicensesAsync(cancellationToken);

        return _licensesAccepted ?? false;
    }

    private async Task LoadLicensesAsync(CancellationToken cancellationToken)
    {
        GetLicensesResponse? licensesResponse = await backendClient.Setup.Licenses.GetAsync(x =>
            {
            },
            cancellationToken
        );

        if (licensesResponse is null)
            throw new ApiException("Server did not return valid licenses.");

        _licensesAccepted = licensesResponse.LicensesAccepted;
        _cachedLicenses = new List<License>(
            (licensesResponse.Licenses ?? [])
            .Select(x => x.ToLicense()));
    }
}
