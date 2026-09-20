using System.Net;
using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Services.Exceptions;

namespace HomeBook.Frontend.Services.Provider;

/// <inheritdoc />
public class ContentProvider(HttpClient httpClient) : IContentProvider
{
    /// <inheritdoc />
    public async Task<string> GetContentAsync(string file)
    {
        try
        {
            return await httpClient.GetStringAsync(file);
        }
        catch (HttpRequestException err) when (err.StatusCode == HttpStatusCode.NotFound)
        {
            throw new HttpNotFoundException(file, "response is not found.", err);
        }
    }
}
