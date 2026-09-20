using System.ComponentModel.DataAnnotations;

namespace HomeBook.Frontend.Core.Models.UserPreferences;

public class UserPreferenceLocalizationViewModel
{
    [Required(ErrorMessage = "You must select a language")]
    [StringLength(5, ErrorMessage = "You selected an invalid language")]
    public string? Locale { get; set; } = null;
}
