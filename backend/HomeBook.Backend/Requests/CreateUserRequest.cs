namespace HomeBook.Backend.Requests;

/// <summary>
/// Request model for creating a new user
/// </summary>
/// <param name="Username">The username for the new user</param>
/// <param name="Password">The password for the new user</param>
/// <param name="IsAdmin">Whether the user should have admin privileges</param>
public record CreateUserRequest(string Username, string Password, bool IsAdmin);
