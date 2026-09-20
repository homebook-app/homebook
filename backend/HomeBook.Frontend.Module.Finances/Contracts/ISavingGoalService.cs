using HomeBook.Frontend.Module.Finances.Models;

namespace HomeBook.Frontend.Module.Finances.Contracts;

/// <summary>
///
/// </summary>
public interface ISavingGoalService
{
    /// <summary>
    /// gets all saving goals
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<IEnumerable<SavingGoalDto>> GetAllSavingGoalsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    ///
    /// </summary>
    /// <param name="id"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<SavingGoalDto?> GetSavingGoalByIdAsync(Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///
    /// </summary>
    /// <param name="savingGoal"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<Guid> CreateSavingGoalAsync(SavingGoalDto savingGoal,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///
    /// </summary>
    /// <param name="savingGoal"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task UpdateSavingGoalAsync(SavingGoalDto savingGoal,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///
    /// </summary>
    /// <param name="id"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task DeleteSavingGoalAsync(Guid id,
        CancellationToken cancellationToken = default);
}
