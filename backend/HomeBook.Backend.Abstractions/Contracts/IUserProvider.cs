using HomeBook.Backend.Abstractions.Models.UserManagement;

namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// contains provider definitions for user management
/// </summary>
public interface IUserProvider
{
    /// <summary>
    /// creates a new user with the given informations
    /// </summary>
    /// <param name="username"></param>
    /// <param name="password"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<Guid> CreateUserAsync(string username,
        string password,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// returns if a user with the given username already exists
    /// </summary>
    /// <param name="username"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<bool> ContainsUserAsync(string username,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// returns all users
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<IEnumerable<UserInfo>> GetAllAsync(CancellationToken cancellationToken);

    /// <summary>
    /// updates the given user
    /// </summary>
    /// <param name="userInfo"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdateUserAsync(UserInfo userInfo, CancellationToken cancellationToken);

    /// <summary>
    /// updates the admin flag of the given user
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="isAdmin"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdateAdminFlag(Guid userId,
        bool isAdmin,
        CancellationToken cancellationToken);

    /// <summary>
    ///
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<UserInfo?> GetUserByIdAsync(Guid userId,
        CancellationToken cancellationToken);
}
