namespace HomeBook.Frontend.Abstractions.Models;

public record MenuItem(string Title,
    string Url,
    string? Icon = null,
    IEnumerable<MenuItem>? Children = null);
