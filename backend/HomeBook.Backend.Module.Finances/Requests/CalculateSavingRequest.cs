using HomeBook.Backend.Module.Finances.Enums;

namespace HomeBook.Backend.Module.Finances.Requests;

/// <summary>
///
/// </summary>
/// <param name="TargetAmount"></param>
/// <param name="TargetDate"></param>
/// <param name="InterestRateOption"><see cref="InterestRateOptions"/> 0 = NONE, 1 = MONTHLY, 2 = YEARLY</param>
/// <param name="InterestRate"></param>
/// <param name="TargetSimpleRate"></param>
public record CalculateSavingRequest(
    decimal TargetAmount,
    DateTime TargetDate,
    int InterestRateOption,
    decimal InterestRate,
    bool TargetSimpleRate);
