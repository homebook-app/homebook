using HomeBook.Client;
using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Contracts;

namespace HomeBook.Frontend.Services.Provider;

public class InstanceManagementProvider(
    BackendClient backendClient,
    IAuthenticationService authenticationService) : IInstanceManagementProvider
{
    private string? _instanceName;
    private string? _defaultLocale;

    public async Task<string> GetInstanceNameAsync(CancellationToken cancellationToken = default)
    {
        if (_instanceName is null)
            await LoadInstanceInfoAsync(cancellationToken);

        return _instanceName ?? string.Empty;
    }

    public async Task<string> GetDefaultLocaleAsync(CancellationToken cancellationToken = default)
    {
        if (_defaultLocale is null)
            await LoadInstanceInfoAsync(cancellationToken);

        return _defaultLocale ?? string.Empty;
    }

    public async Task UpdateInstanceNameAsync(string newName, CancellationToken cancellationToken = default)
    {
        await authenticationService.IsAdminOrThrowAsync(cancellationToken);

        if (string.IsNullOrEmpty(newName))
            throw new ArgumentException("Instance name cannot be null or empty.", nameof(newName));

        string? token = await authenticationService.GetTokenAsync(cancellationToken);
        await backendClient.System.Instance.Name.PutAsync(new UpdateInstanceNameRequest()
            {
                Name = newName
            },
            x =>
            {
                x.Headers.Add("Authorization", $"Bearer {token}");
            },
            cancellationToken);
    }

    public async Task UpdateDefaultLocaleAsync(string locale, CancellationToken cancellationToken = default)
    {
        await authenticationService.IsAdminOrThrowAsync(cancellationToken);

        if (string.IsNullOrEmpty(locale))
            throw new ArgumentException("Locale cannot be null or empty.", nameof(locale));

        string? token = await authenticationService.GetTokenAsync(cancellationToken);
        await backendClient.System.Instance.DefaultLocale.PutAsync(new UpdateInstanceDefaultLocaleRequest()
            {
                Locale = locale
            },
            x =>
            {
                x.Headers.Add("Authorization", $"Bearer {token}");
            },
            cancellationToken);
    }

    private async Task LoadInstanceInfoAsync(CancellationToken cancellationToken)
    {
        string? instanceName = await backendClient.Info.Name.GetAsync(x =>
            {
            },
            cancellationToken);
        string? defaultLocale = await backendClient.Info.DefaultLocale.GetAsync(x =>
            {
            },
            cancellationToken);

        _instanceName = instanceName;
        _defaultLocale = defaultLocale;
    }
}
