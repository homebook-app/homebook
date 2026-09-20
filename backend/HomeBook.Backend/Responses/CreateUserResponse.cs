namespace HomeBook.Backend.Responses;

/// <summary>
/// Response model for user creation
/// </summary>
/// <param name="UserId">The ID of the newly created user</param>
public record CreateUserResponse(Guid UserId);
