namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// defines the update processor
/// </summary>
public interface IUpdateProcessor
{
    Task ProcessAsync(CancellationToken cancellationToken = default);
}
