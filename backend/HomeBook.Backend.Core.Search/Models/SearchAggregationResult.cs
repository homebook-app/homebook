using HomeBook.Backend.Abstractions.Contracts;

namespace HomeBook.Backend.Core.Search.Models;

public record SearchAggregationResult(
    string ModuleKey,
    int TotalCount,
    IEnumerable<ISearchResultItem> Items) : ISearchAggregationResult;
