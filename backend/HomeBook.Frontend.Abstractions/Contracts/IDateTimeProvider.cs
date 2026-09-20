namespace HomeBook.Frontend.Abstractions.Contracts;

public interface IDateTimeProvider
{
    DateTime Now { get; }
    DateTime UtcNow { get; }
}
