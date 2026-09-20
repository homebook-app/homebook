namespace HomeBook.Frontend.Abstractions.Contracts;

public interface IStartMenuItem
{
    string Title { get; }
    string Caption { get; }
    string Url { get; }
    string Icon { get; }
    string Color { get; }
    string Translate(string key, params object[] args);
}
