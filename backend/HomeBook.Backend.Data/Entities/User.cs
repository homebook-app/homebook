using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace HomeBook.Backend.Data.Entities;

[DebuggerDisplay("[{nameof(User)}] {Username}")]
[Table("Users")]
public class User
{
    /// <summary>
    /// The id of this Product Team
    /// </summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Required]
    public Guid Id { get; set; }

    /// <summary>
    /// The username of this user
    /// </summary>
    [Required]
    [StringLength(20, MinimumLength = 5, ErrorMessage = "The username must be between 5 and 20 characters long.")]
    public required string Username { get; set; }

    /// <summary>
    /// The password hash of this user
    /// </summary>
    [Required]
    [StringLength(512, ErrorMessage = "The password hash cannot exceed 512 characters.")]
    public required string PasswordHash { get; set; }

    /// <summary>
    /// The type of the password hash
    /// </summary>
    [Required]
    [StringLength(50, ErrorMessage = "The password hash type cannot exceed 50 characters.")]
    public required string PasswordHashType { get; set; }

    /// <summary>
    /// UTC timestamp of creation - automatically set by the database
    /// </summary>
    [Required]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime Created { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// UTC timestamp of deactivation (null = active)
    /// </summary>
    public DateTime? Disabled { get; set; }

    /// <summary>
    /// UTC timestamp of creation - automatically set by the database
    /// </summary>
    [Required]
    public bool IsAdmin { get; set; } = false;
}
