using HomeBook.Backend.Module.Finances.Models;

namespace HomeBook.Backend.Module.Finances.Contracts;

/// <summary>
///
/// </summary>
public interface IFinanceCalculationsService
{
    /// <summary>
    ///
    /// </summary>
    /// <param name="targetAmount"></param>
    /// <param name="targetDate"></param>
    /// <param name="targetSimpleRate"></param>
    /// <returns></returns>
    SavingCalculationResult CalculateSavings(decimal targetAmount,
        DateTime targetDate,
        bool targetSimpleRate = true);

    /// <summary>
    ///
    /// </summary>
    /// <param name="targetAmount"></param>
    /// <param name="targetDate"></param>
    /// <param name="interestRate"></param>
    /// <param name="targetSimpleRate"></param>
    /// <returns></returns>
    SavingCalculationResult CalculateMonthlySavings(decimal targetAmount,
        DateTime targetDate,
        decimal interestRate,
        bool targetSimpleRate = true);

    /// <summary>
    ///
    /// </summary>
    /// <param name="targetAmount"></param>
    /// <param name="targetDate"></param>
    /// <param name="interestRate"></param>
    /// <param name="targetSimpleRate"></param>
    /// <returns></returns>
    SavingCalculationResult CalculateYearlySavings(decimal targetAmount,
        DateTime targetDate,
        decimal interestRate,
        bool targetSimpleRate = true);
}
