namespace HomeBook.Frontend.Module.Finances.ViewModels;

public class SavingGoalOverviewViewModel(
    Guid? id,
    string name,
    string iconName,
    string color,
    decimal targetAmount,
    decimal currentAmount,
    DateTime? targetDate,
    double percentage)
{
    public Guid? Id { get; } = id;
    public string Name { get; } = name;
    public string IconName { get; } = iconName;
    public string Color { get; } = color;
    public decimal TargetAmount { get; } = targetAmount;
    public decimal CurrentAmount { get; } = currentAmount;
    public DateTime? TargetDate { get; } = targetDate;
    public double Percentage { get; } = percentage;
    public decimal RemainingAmount => TargetAmount - CurrentAmount;
}
