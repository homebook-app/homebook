using Microsoft.Extensions.Configuration;

namespace HomeBook.Frontend.Modules.Abstractions;

/// <summary>
/// defines a contract for modules that want to register widgets
/// </summary>
public interface IModuleWidgetRegistration
{
    /// <summary>
    /// register widgets provided by the module
    /// </summary>
    /// <param name="builder"></param>
    /// <param name="configuration"></param>
    static abstract void RegisterWidgets(IWidgetBuilder builder,
        IConfiguration configuration);
}
