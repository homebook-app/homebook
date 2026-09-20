namespace HomeBook.Frontend.Abstractions.Contracts;

/// <summary>
/// defines a provider for retrieving content from specified files.
/// </summary>
public interface IContentProvider
{
    /// <summary>
    /// returns the content of the specified file as a string asynchronously.
    /// </summary>
    /// <param name="file"></param>
    /// <returns></returns>
    Task<string> GetContentAsync(string file);
}
