using Microsoft.Extensions.Configuration;

namespace HomeBook.Frontend.Modules.Abstractions;

/// <summary>
/// defines a module that can register start menu items
/// </summary>
public interface IModuleStartMenuRegistration
{
    /// <summary>
    /// register start menu items
    /// </summary>
    /// <param name="builder"></param>
    /// <param name="configuration"></param>
    static abstract void RegisterStartMenuItems(IStartMenuBuilder builder,
        IConfiguration configuration);
}
