using FluentValidation;
using HomeBook.Backend.Data.Entities;

namespace HomeBook.Backend.Data.Validators;

public class UserValidator : AbstractValidator<User>
{
    public UserValidator()
    {
        RuleFor(user => user.Username)
            .NotEmpty()
            .WithMessage("Username is required.")
            .Length(5, 20)
            .WithMessage("Username must be between 5 and 20 characters long.")
            .Matches("^[a-zA-Z0-9_-]+$")
            .WithMessage("Username can only contain letters, numbers, underscores, and hyphens.");

        RuleFor(user => user.PasswordHash)
            .NotEmpty()
            .WithMessage("Password hash is required.")
            .MaximumLength(512)
            .WithMessage("Password hash cannot exceed 512 characters.");

        RuleFor(user => user.PasswordHashType)
            .NotEmpty()
            .WithMessage("Password hash type is required.")
            .MaximumLength(50)
            .WithMessage("Password hash type cannot exceed 50 characters.");
    }
}
