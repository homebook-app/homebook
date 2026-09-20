using System.ComponentModel.DataAnnotations;

namespace HomeBook.Backend.Requests;

public record LoginRequest
{
    [Required]
    [MinLength(6)]
    public required string Username { get; init; }

    [Required]
    [MinLength(5)]
    public required string Password { get; init; }
}
