using System.ComponentModel.DataAnnotations;

namespace HomeBook.Frontend.Core.Models.Account;

public class LoginModel
{
    [Required(ErrorMessage = "Username is required")]
    [MinLength(3, ErrorMessage = "Username must be at least 3 characters")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(5, ErrorMessage = "Password must be at least 5 characters")]
    public string Password { get; set; } = string.Empty;
}
