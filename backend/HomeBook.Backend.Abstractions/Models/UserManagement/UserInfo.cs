namespace HomeBook.Backend.Abstractions.Models.UserManagement;

public record UserInfo(Guid Id,
    string Username,
    DateTime Created,
    DateTime? Disabled,
    bool IsAdmin)
{
    public DateTime Created { get; set; } = Created;
    public DateTime? Disabled { get; set; } = Disabled;
    public bool IsAdmin { get; set; } = IsAdmin;
}
