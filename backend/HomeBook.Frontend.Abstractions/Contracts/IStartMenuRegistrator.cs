using HomeBook.Frontend.Abstractions.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HomeBook.Frontend.Abstractions.Contracts;

/// <summary>
/// defines a contract for retrieving start menu items
/// </summary>
public interface IStartMenuRegistrator
{
    /// <summary>
    /// gets all registered start menu items
    /// </summary>
    /// <returns></returns>
    StartMenuBuilderItem[] GetStartMenuItems();

    /// <summary>
    /// registers start menu items during service configuration
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    void RegisterStartMenuItems(IServiceCollection services,
        IConfiguration configuration);
}
