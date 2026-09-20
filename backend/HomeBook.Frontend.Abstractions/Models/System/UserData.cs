namespace HomeBook.Frontend.Abstractions.Models.System;

public record UserData(
    Guid Id,
    string UserName,
    DateTime CreatedAt,
    DateTime? DisabledAt = null,
    bool IsAdmin = false);
