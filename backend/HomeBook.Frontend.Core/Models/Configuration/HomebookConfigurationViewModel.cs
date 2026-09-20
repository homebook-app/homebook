using System.ComponentModel.DataAnnotations;

namespace HomeBook.Frontend.Core.Models.Configuration;

public class HomebookConfigurationViewModel
{
    [Required(ErrorMessage = "A Name for your HomeBook is required")]
    [StringLength(255, ErrorMessage = "The Name cannot exceed 255 characters")]
    public string InstanceName { get; set; } = string.Empty;

    [Required(ErrorMessage = "You must select a default language")]
    [StringLength(5, ErrorMessage = "You selected an invalid language")]
    public string InstanceDefaultLocale { get; set; } = string.Empty;
}
