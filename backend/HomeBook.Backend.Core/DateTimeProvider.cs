using HomeBook.Backend.Abstractions.Contracts;

namespace HomeBook.Backend.Core;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime Now => DateTime.Now;
    public DateTime UtcNow => DateTime.UtcNow;
}
