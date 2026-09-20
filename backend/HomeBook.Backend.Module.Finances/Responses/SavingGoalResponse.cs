using System.Diagnostics;
using HomeBook.Backend.Module.Finances.Enums;

namespace HomeBook.Backend.Module.Finances.Responses;

[DebuggerDisplay("{Name} ({CurrentAmount} / {TargetAmount})")]
public record SavingGoalResponse(
    Guid Id,
    string Name,
    string Color,
    string Icon,
    decimal TargetAmount,
    decimal CurrentAmount,
    decimal MonthlyPayment,
    int InterestRateOption,
    decimal? InterestRate,
    DateTime? TargetDate);
