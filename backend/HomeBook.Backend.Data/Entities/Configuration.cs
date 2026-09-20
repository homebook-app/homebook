using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace HomeBook.Backend.Data.Entities;

[DebuggerDisplay("{[{nameof(Configuration)}] Key}={Value}")]
[Table("Configurations")]
public class Configuration
{
    /// <summary>
    /// the id of this configuration entry
    /// </summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Required]
    public Guid Id { get; set; }

    /// <summary>
    /// the key of this configuration
    /// </summary>
    [Required]
    [StringLength(50, MinimumLength = 5, ErrorMessage = "Key must be between 5 and 50 characters long.")]
    public required string Key { get; set; }

    /// <summary>
    /// the value of this configuration
    /// </summary>
    [Required]
    public required string Value { get; set; }
}
