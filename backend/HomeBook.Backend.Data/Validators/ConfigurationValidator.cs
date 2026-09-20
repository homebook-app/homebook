using FluentValidation;
using HomeBook.Backend.Data.Entities;

namespace HomeBook.Backend.Data.Validators;

public class ConfigurationValidator : AbstractValidator<Configuration>
{
    public ConfigurationValidator()
    {
        RuleFor(config => config.Value)
            .NotEmpty()
            .WithMessage("Configuration value is required and cannot be empty or whitespace.")
            .MaximumLength(100)
            .WithMessage("Configuration value cannot exceed 100 characters.");
    }
}
