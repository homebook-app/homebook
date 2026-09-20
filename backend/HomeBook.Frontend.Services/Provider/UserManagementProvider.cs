using HomeBook.Client;
using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Abstractions.Models.System;
using HomeBook.Frontend.Services.Mappings;

namespace HomeBook.Frontend.Services.Provider;

/// <inheritdoc />
public class UserManagementProvider(
    BackendClient backendClient,
    IAuthenticationService authenticationService) : IUserManagementProvider
{
    /// <inheritdoc />
    public async Task<PagedList<UserData>?> GetAllUsersAsync(ushort page = 1,
        ushort pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        await authenticationService.IsAdminOrThrowAsync(cancellationToken);

        string? token = await authenticationService.GetTokenAsync(cancellationToken);
        UsersResponse? response = await backendClient.System.Users
            .GetAsync(x =>
                {
                    x.QueryParameters.Page = page;
                    x.QueryParameters.PageSize = pageSize;

                    x.Headers.Add("Authorization", $"Bearer {token}");
                },
                cancellationToken);

        if (response is null)
            return null;

        return response.ToPagedResult();
    }

    /// <inheritdoc />
    public async Task<UserData?> GetUserByIdAsync(Guid userId,
        CancellationToken cancellationToken = default)
    {
        await authenticationService.IsAdminOrThrowAsync(cancellationToken);

        string? token = await authenticationService.GetTokenAsync(cancellationToken);
        UserResponse? response = await backendClient.System.Users[userId]
            .GetAsync(x =>
                {
                    x.Headers.Add("Authorization", $"Bearer {token}");
                },
                cancellationToken);

        return response?.ToUserData();
    }

    /// <inheritdoc />
    public async Task<Guid?> CreateUserAsync(string username,
        string password,
        bool isAdmin = false,
        CancellationToken cancellationToken = default)
    {
        await authenticationService.IsAdminOrThrowAsync(cancellationToken);

        CreateUserRequest request = new()
        {
            Username = username,
            Password = password,
            IsAdmin = isAdmin
        };

        // TODO: validator

        string? token = await authenticationService.GetTokenAsync(cancellationToken);
        CreateUserResponse? response = await backendClient.System.Users
            .PostAsync(request,
                x =>
                {
                    x.Headers.Add("Authorization", $"Bearer {token}");
                },
                cancellationToken);

        return response?.UserId;
    }

    /// <inheritdoc />
    public async Task DeleteUserAsync(Guid userId,
        CancellationToken cancellationToken = default)
    {
        await authenticationService.IsAdminOrThrowAsync(cancellationToken);

        string? token = await authenticationService.GetTokenAsync(cancellationToken);
        await backendClient.System.Users[userId]
            .DeleteAsync(x =>
                {
                    x.Headers.Add("Authorization", $"Bearer {token}");
                },
                cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdatePasswordAsync(Guid userId,
        string newPassword,
        CancellationToken cancellationToken = default)
    {
        await authenticationService.IsAdminOrThrowAsync(cancellationToken);

        string? token = await authenticationService.GetTokenAsync(cancellationToken);
        await backendClient.System.Users[userId]
            .Password.PutAsync(new UpdatePasswordRequest
                {
                    NewPassword = newPassword
                },
                x =>
                {
                    x.Headers.Add("Authorization", $"Bearer {token}");
                },
                cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAdminFlagAsync(Guid userId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        await authenticationService.IsAdminOrThrowAsync(cancellationToken);

        string? token = await authenticationService.GetTokenAsync(cancellationToken);
        await backendClient.System.Users[userId]
            .Admin.PutAsync(new UpdateUserAdminRequest
                {
                    IsAdmin = isAdmin
                },
                x =>
                {
                    x.Headers.Add("Authorization", $"Bearer {token}");
                },
                cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateUsernameAsync(Guid userId,
        string username,
        CancellationToken cancellationToken = default)
    {
        await authenticationService.IsAdminOrThrowAsync(cancellationToken);

        string? token = await authenticationService.GetTokenAsync(cancellationToken);
        await backendClient.System.Users[userId]
            .Username.PutAsync(new UpdateUsernameRequest()
                {
                    NewUsername = username
                },
                x =>
                {
                    x.Headers.Add("Authorization", $"Bearer {token}");
                },
                cancellationToken);
    }

    /// <inheritdoc />
    public async Task EnableUserAsync(Guid userId,
        CancellationToken cancellationToken = default)
    {
        await authenticationService.IsAdminOrThrowAsync(cancellationToken);

        string? token = await authenticationService.GetTokenAsync(cancellationToken);
        await backendClient.System.Users[userId]
            .Enable.PutAsync(x =>
                {
                    x.Headers.Add("Authorization", $"Bearer {token}");
                },
                cancellationToken);
    }

    /// <inheritdoc />
    public async Task DisableUserAsync(Guid userId,
        CancellationToken cancellationToken = default)
    {
        await authenticationService.IsAdminOrThrowAsync(cancellationToken);

        string? token = await authenticationService.GetTokenAsync(cancellationToken);
        await backendClient.System.Users[userId]
            .Disable.PutAsync(x =>
                {
                    x.Headers.Add("Authorization", $"Bearer {token}");
                },
                cancellationToken);
    }
}
