namespace HomeBook.Frontend.Modules.Abstractions;

/// <summary>
///
/// </summary>
public interface IStartMenuBuilder
{
    /// <summary>
    ///
    /// </summary>
    /// <param name="moduleId"></param>
    void WithModule(string moduleId);

    /// <summary>
    ///
    /// </summary>
    /// <param name="Title"></param>
    /// <param name="Caption"></param>
    /// <param name="Url"></param>
    /// <param name="Icon"></param>
    /// <param name="Color"></param>
    /// <returns></returns>
    IStartMenuBuilder AddStartMenuTile(string Title,
        string Caption,
        string Url,
        string Icon,
        string Color);
}
