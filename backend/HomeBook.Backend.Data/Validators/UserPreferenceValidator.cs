using FluentValidation;
using HomeBook.Backend.Data.Entities;

namespace HomeBook.Backend.Data.Validators;

public class UserPreferenceValidator : AbstractValidator<UserPreference>
{
    public UserPreferenceValidator()
    {
        RuleFor(config => config.Value)
            .NotEmpty()
            .WithMessage("UserPreference value is required and cannot be empty or whitespace.")
            .MaximumLength(100)
            .WithMessage("UserPreference value cannot exceed 100 characters.");
    }
}
