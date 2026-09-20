namespace HomeBook.Backend.Requests;

public record UpdatePasswordRequest(Guid UserId, string NewPassword);
