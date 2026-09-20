using HomeBook.Client;
using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Abstractions.Models.System;
using HomeBook.Frontend.Services.Mappings;

namespace HomeBook.Frontend.Services.Provider;

/// <inheritdoc />
public class SystemManagementProvider(
    BackendClient backendClient,
    IAuthenticationService authenticationService) : ISystemManagementProvider
{
    /// <inheritdoc />
    public async Task<SystemInfo?> GetSystemInfoAsync(CancellationToken cancellationToken = default)
    {
        await authenticationService.IsAdminOrThrowAsync(cancellationToken);

        string? token = await authenticationService.GetTokenAsync(cancellationToken);
        GetSystemInfoResponse? response = await backendClient.System.Instance.Info.GetAsync(x =>
            {
                x.Headers.Add("Authorization", $"Bearer {token}");
            },
            cancellationToken);

        SystemInfo? result = response?.ToSystemInfo();
        return result;
    }
}
