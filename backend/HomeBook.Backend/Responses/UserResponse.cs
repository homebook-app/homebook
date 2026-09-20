namespace HomeBook.Backend.Responses;

/// <summary>
/// Response model for user information
/// </summary>
/// <param name="Id">The user ID</param>
/// <param name="Username">The username</param>
/// <param name="Created">UTC timestamp of creation</param>
/// <param name="Disabled">UTC timestamp of deactivation (null = active)</param>
/// <param name="IsAdmin">Whether the user has admin privileges</param>
public record UserResponse(Guid Id,
    string Username,
    DateTime Created,
    DateTime? Disabled,
    bool IsAdmin);
