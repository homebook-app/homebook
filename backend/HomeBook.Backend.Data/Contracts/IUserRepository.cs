using HomeBook.Backend.Data.Entities;

namespace HomeBook.Backend.Data.Contracts;

/// <summary>
/// defines repository for user management
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// creates a new user with the given informations
    /// </summary>
    /// <param name="user"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<User> CreateUserAsync(User user,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// checks if a user with the given username already exists
    /// </summary>
    /// <param name="username"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<bool> ContainsUserAsync(string username,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// returns the user with the given user-id or null if not found
    /// </summary>
    /// <param name="id"></param>
    /// <param name="cancellationToken"></param>
    /// <param name="appDbContext"></param>
    /// <returns></returns>
    Task<User?> GetUserByIdAsync(Guid id,
        CancellationToken cancellationToken = default,
        AppDbContext? appDbContext = null);

    /// <summary>
    /// returns the user with the given username or null if not found
    /// </summary>
    /// <param name="username"></param>
    /// <param name="cancellationToken"></param>
    /// <param name="appDbContext"></param>
    /// <returns></returns>
    Task<User?> GetUserByUsernameAsync(string username,
        CancellationToken cancellationToken = default,
        AppDbContext? appDbContext = null);

    /// <summary>
    /// returns all users
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken);

    /// <summary>
    /// updates the given user
    /// </summary>
    /// <param name="user"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<User> UpdateUserAsync(User user, CancellationToken cancellationToken);

    Task<User?> UpdateAsync(Guid userId, Action<User> updateHandler, CancellationToken cancellationToken);

    /// <summary>
    /// deletes the user with the given user-id
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="cancellationToken"></param>
    /// <returns>true if user was deleted, false if user was not found</returns>
    Task<bool> DeleteAsync(Guid userId, CancellationToken cancellationToken = default);
}
