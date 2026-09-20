namespace HomeBook.Backend.Abstractions.Contracts;

public interface ISearchAggregationResult
{
    public string ModuleKey { get; }
    public int TotalCount { get; }
    public IEnumerable<ISearchResultItem> Items { get; }
}
