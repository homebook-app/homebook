using HomeBook.Backend.Data.Entities;

namespace HomeBook.Backend.Data.Contracts;

public interface IIngredientRepository
{
    /// <summary>
    ///
    /// </summary>
    /// <param name="entity"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<Guid> CreateOrUpdateAsync(RecipeIngredient entity,
        CancellationToken cancellationToken);

    /// <summary>
    ///
    /// </summary>
    /// <param name="entityId"></param>
    /// <param name="cancellationToken"></param>
    /// <param name="appDbContext"></param>
    /// <returns></returns>
    Task<RecipeIngredient?> GetByIdAsync(Guid entityId,
        CancellationToken cancellationToken,
        AppDbContext? appDbContext = null);

    /// <summary>
    ///
    /// </summary>
    /// <param name="name"></param>
    /// <param name="cancellationToken"></param>
    /// <param name="appDbContext"></param>
    /// <returns></returns>
    Task<RecipeIngredient?> GetByName(string name,
        CancellationToken cancellationToken,
        AppDbContext? appDbContext = null);
}
