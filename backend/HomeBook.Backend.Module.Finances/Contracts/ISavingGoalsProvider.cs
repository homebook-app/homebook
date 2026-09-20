using HomeBook.Backend.Module.Finances.Enums;
using HomeBook.Backend.Module.Finances.Models;

namespace HomeBook.Backend.Module.Finances.Contracts;

/// <summary>
///
/// </summary>
public interface ISavingGoalsProvider
{
    /// <summary>
    ///
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<SavingGoalDto[]> GetAllSavingGoalsAsync(Guid userId,
        CancellationToken cancellationToken);

    /// <summary>
    /// /
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="savingGoalId"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<SavingGoalDto?> GetSavingGoalByIdAsync(Guid userId,
        Guid savingGoalId,
        CancellationToken cancellationToken);

    /// <summary>
    ///
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="name"></param>
    /// <param name="color"></param>
    /// <param name="icon"></param>
    /// <param name="targetAmount"></param>
    /// <param name="currentAmount"></param>
    /// <param name="monthlyPayment"></param>
    /// <param name="interestRateOption"></param>
    /// <param name="interestRate"></param>
    /// <param name="targetDate"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<Guid> CreateAsync(Guid userId,
        string name,
        string color,
        string icon,
        decimal targetAmount,
        decimal currentAmount,
        decimal monthlyPayment,
        InterestRateOptions? interestRateOption,
        decimal? interestRate,
        DateTime? targetDate,
        CancellationToken cancellationToken);

    /// <summary>
    ///
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="savingGoalId"></param>
    /// <param name="name"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdateSavingGoalNameAsync(Guid userId,
        Guid savingGoalId,
        string name,
        CancellationToken cancellationToken);

    /// <summary>
    ///
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="savingGoalId"></param>
    /// <param name="color"></param>
    /// <param name="icon"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdateSavingGoalAppearanceAsync(Guid userId,
        Guid savingGoalId,
        string color,
        string icon,
        CancellationToken cancellationToken);

    /// <summary>
    ///
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="savingGoalId"></param>
    /// <param name="targetAmount"></param>
    /// <param name="currentAmount"></param>
    /// <param name="monthlyPayment"></param>
    /// <param name="interestRateOption"></param>
    /// <param name="interestRate"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdateSavingGoalAmountsAsync(Guid userId,
        Guid savingGoalId,
        decimal? targetAmount,
        decimal? currentAmount,
        decimal? monthlyPayment,
        InterestRateOptions? interestRateOption,
        decimal? interestRate,
        CancellationToken cancellationToken);

    /// <summary>
    ///
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="savingGoalId"></param>
    /// <param name="targetDate"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdateSavingGoalInfoAsync(Guid userId,
        Guid savingGoalId,
        DateTime? targetDate,
        CancellationToken cancellationToken);

    /// <summary>
    ///
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="savingGoalId"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task DeleteAsync(Guid userId,
        Guid savingGoalId,
        CancellationToken cancellationToken);
}
