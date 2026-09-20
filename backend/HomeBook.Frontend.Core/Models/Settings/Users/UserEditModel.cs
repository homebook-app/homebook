using System.ComponentModel.DataAnnotations;

namespace HomeBook.Frontend.Core.Models.Settings.Users;

public class UserEditModel
{
    [Required(ErrorMessage = "Username is required")]
    [StringLength(20, MinimumLength = 5, ErrorMessage = "Username must be between 5 and 20 characters")]
    public string Username { get; set; } = string.Empty;

    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters")]
    public string Password { get; set; } = string.Empty;

    public string ConfirmPassword { get; set; } = string.Empty;

    public bool IsAdmin { get; set; } = false;

    public bool IsEnabled { get; set; } = false;
}
