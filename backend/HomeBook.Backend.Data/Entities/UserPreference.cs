using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;

namespace HomeBook.Backend.Data.Entities;

[DebuggerDisplay("[{nameof(UserPreference)}] {Key}={Value}")]
[Table("UserPreferences")]
[PrimaryKey(nameof(UserId), nameof(Key))]
public class UserPreference
{
    /// <summary>
    /// the id of the user this preference belongs to
    /// </summary>
    [Required]
    [ForeignKey(nameof(User))]
    public Guid UserId { get; set; }

    /// <summary>
    /// navigation property to the user
    /// </summary>
    public virtual User? User { get; set; }

    /// <summary>
    /// the key of this user preference
    /// </summary>
    [Required]
    [StringLength(50, MinimumLength = 5, ErrorMessage = "Key must be between 5 and 50 characters long.")]
    public required string Key { get; set; }

    /// <summary>
    /// the value of this user preference
    /// </summary>
    [Required]
    public required string Value { get; set; }
}
