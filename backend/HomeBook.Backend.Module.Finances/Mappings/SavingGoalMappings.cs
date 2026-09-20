using HomeBook.Backend.Module.Finances.Enums;
using HomeBook.Backend.Module.Finances.Models;
using HomeBook.Backend.Module.Finances.Responses;

namespace HomeBook.Backend.Module.Finances.Mappings;

public static class SavingGoalMappings
{
    public static SavingGoalDto ToDto(this Data.Entities.SavingGoal savingGoal)
    {
        return new SavingGoalDto(
            savingGoal.Id,
            savingGoal.Name,
            savingGoal.Color,
            savingGoal.Icon ?? string.Empty,
            savingGoal.TargetAmount,
            savingGoal.CurrentAmount,
            savingGoal.MonthlyPayment,
            (InterestRateOptions)savingGoal.InterestRateOption,
            savingGoal.InterestRate,
            savingGoal.TargetDate);
    }

    public static SavingGoalResponse ToResponse(this SavingGoalDto savingGoal)
    {
        return new SavingGoalResponse(
            savingGoal.Id,
            savingGoal.Name,
            savingGoal.Color,
            savingGoal.Icon ?? string.Empty,
            savingGoal.TargetAmount,
            savingGoal.CurrentAmount,
            savingGoal.MonthlyPayment,
            (int)savingGoal.InterestRateOption,
            savingGoal.InterestRate,
            savingGoal.TargetDate);
    }
}
