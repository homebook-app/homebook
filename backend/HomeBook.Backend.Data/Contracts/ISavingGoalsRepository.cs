using HomeBook.Backend.Data.Entities;

namespace HomeBook.Backend.Data.Contracts;

/// <summary>
///
/// </summary>
public interface ISavingGoalsRepository
{
    /// <summary>
    ///
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<IEnumerable<SavingGoal>> GetAllSavingGoalsAsync(Guid userId,
        CancellationToken cancellationToken);

    /// <summary>
    ///
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="entityId"></param>
    /// <param name="cancellationToken"></param>
    /// <param name="appDbContext"></param>
    /// <returns></returns>
    Task<SavingGoal?> GetByIdAsync(Guid userId,
        Guid entityId,
        CancellationToken cancellationToken,
        AppDbContext? appDbContext = null);

    /// <summary>
    ///
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="entity"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<Guid> CreateOrUpdateAsync(Guid userId,
        SavingGoal entity,
        CancellationToken cancellationToken);

    /// <summary>
    ///
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="entityId"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task DeleteAsync(Guid userId,
        Guid entityId,
        CancellationToken cancellationToken);
}
