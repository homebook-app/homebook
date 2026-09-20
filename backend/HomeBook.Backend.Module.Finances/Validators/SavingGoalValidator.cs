using FluentValidation;
using HomeBook.Backend.Data.Entities;

namespace HomeBook.Backend.Core.Finances.Validators;

public class SavingGoalValidator : AbstractValidator<SavingGoal>
{
    public SavingGoalValidator()
    {
        RuleFor(sg => sg.Name)
            .NotEmpty()
            .WithMessage("Saving goal name is required.")
            .MaximumLength(50)
            .WithMessage("Saving goal name cannot exceed 50 characters.");

        RuleFor(sg => sg.Color)
            .NotEmpty()
            .WithMessage("Saving goal color is required.")
            .Matches("^#([0-9A-Fa-f]{6})$")
            .WithMessage("Color must be a valid HEX color code (e.g., #FFFFFF).")
            .MaximumLength(7)
            .WithMessage("Color must be 7 characters long (e.g., #FFFFFF).");

        RuleFor(sg => sg.TargetAmount)
            .GreaterThan(0)
            .WithMessage("Target amount must be greater than zero.");

        RuleFor(sg => sg.CurrentAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Current amount cannot be negative.");
    }
}
