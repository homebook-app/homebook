namespace HomeBook.Frontend.Abstractions.Models;

/// <summary>
/// contains a paged list of items of type T
/// </summary>
/// <param name="Page">the current page</param>
/// <param name="PageSize">the size of the page</param>
/// <param name="TotalCount">the total number of items</param>
/// <param name="TotalPages">the total number of pages</param>
/// <param name="Items">the items of the current page</param>
/// <typeparam name="T"></typeparam>
public record PagedList<T>(int Page,
    int PageSize,
    int TotalCount,
    int TotalPages,
    IReadOnlyList<T> Items);
