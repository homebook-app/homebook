using HomeBook.Frontend.Abstractions.Contracts;

namespace HomeBook.Frontend.Services.Provider;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime Now => DateTime.Now;
    public DateTime UtcNow => DateTime.UtcNow;
}
