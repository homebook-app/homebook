namespace HomeBook.Frontend.Module.Finances.Models;

public record SavingGoalDto(
    Guid? Id,
    string Name,
    string IconName,
    string Color,
    decimal TargetAmount,
    decimal CurrentAmount,
    DateTime? TargetDate)
{
    public double Percentage => TargetAmount == 0 ? 0 : (double)(CurrentAmount / TargetAmount);
}
