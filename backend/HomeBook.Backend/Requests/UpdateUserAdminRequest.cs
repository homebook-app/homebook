namespace HomeBook.Backend.Requests;

public record UpdateUserAdminRequest(Guid UserId, bool IsAdmin);
