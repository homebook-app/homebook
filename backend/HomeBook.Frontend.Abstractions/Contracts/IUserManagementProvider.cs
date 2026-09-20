using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Abstractions.Models.System;

namespace HomeBook.Frontend.Abstractions.Contracts;

/// <summary>
/// defines methods to manage users
/// </summary>
public interface IUserManagementProvider
{
    /// <summary>
    /// returns all users of the system
    /// </summary>
    /// <param name="page">the page to return</param>
    /// <param name="pageSize">the size of the page</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<PagedList<UserData>?> GetAllUsersAsync(ushort page = 1,
        ushort pageSize = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// returns a user by its id
    /// </summary>
    /// <param name="userId">the id of the user to return</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<UserData?> GetUserByIdAsync(Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// creates a new user in the system
    /// </summary>
    /// <param name="username">the username of the new user</param>
    /// <param name="password">the password of the new user</param>
    /// <param name="isAdmin">whether the user should be an admin</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<Guid?> CreateUserAsync(string username,
        string password,
        bool isAdmin = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// deletes a user from the system
    /// </summary>
    /// <param name="userId">the id of the user to delete</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task DeleteUserAsync(Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// updates the password of a user
    /// </summary>
    /// <param name="userId">the id of the user to update</param>
    /// <param name="newPassword">the new password of the user</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdatePasswordAsync(Guid userId,
        string newPassword,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// updates the admin flag of a user
    /// </summary>
    /// <param name="userId">the id of the user to update</param>
    /// <param name="isAdmin">the new admin flag of the user</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdateAdminFlagAsync(Guid userId,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// updates the username of a user
    /// </summary>
    /// <param name="userId">the id of the user to update</param>
    /// <param name="username">the new username of the user</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdateUsernameAsync(Guid userId,
        string username,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// enables a user (if disabled)
    /// </summary>
    /// <param name="userId">the id of the user to enable</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task EnableUserAsync(Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// disables a user (if enabled)
    /// </summary>
    /// <param name="userId">the id of the user to disable</param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task DisableUserAsync(Guid userId,
        CancellationToken cancellationToken = default);
}
