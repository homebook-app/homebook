namespace HomeBook.Backend.Responses;

public record LoginResponse
{
    public required string Token { get; init; }
    public required string RefreshToken { get; init; }
    public required DateTime ExpiresAt { get; init; }
    public required Guid UserId { get; init; }
    public required string Username { get; init; }
}
