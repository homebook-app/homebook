namespace HomeBook.Backend.Responses;

/// <summary>
/// Response model for paginated user list
/// </summary>
/// <param name="Users">List of users</param>
/// <param name="TotalCount">Total number of users</param>
/// <param name="Page">Current page number</param>
/// <param name="PageSize">Number of items per page</param>
/// <param name="TotalPages">Total number of pages</param>
public record UsersResponse(IEnumerable<UserResponse> Users,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages);
