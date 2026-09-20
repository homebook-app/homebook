using System.ComponentModel.DataAnnotations;

namespace HomeBook.Frontend.Core.Models.Setup;

public class UserConfigurationViewModel
{
    [Required(ErrorMessage = "Username is required")]
    [StringLength(255, ErrorMessage = "Username cannot exceed 255 characters")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [StringLength(255, ErrorMessage = "Password cannot exceed 255 characters")]
    public string Password { get; set; } = string.Empty;
}
