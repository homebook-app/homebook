namespace HomeBook.Backend.Abstractions.Contracts;

/// <summary>
/// defines a factory for creating instances of <see cref="ISetupProcessor"/>
/// </summary>
public interface ISetupProcessorFactory
{
    /// <summary>
    /// creates a new instance of <see cref="ISetupProcessor"/>
    /// </summary>
    /// <returns></returns>
    ISetupProcessor Create();
}
