namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
///
/// </summary>
public interface ISearchProvider
{
    /// <summary>
    ///
    /// </summary>
    /// <param name="query"></param>
    /// <param name="userId"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<IReadOnlyList<ISearchAggregationResult>>
        SearchAsync(string query,
            Guid userId,
            CancellationToken cancellationToken = default);
}
