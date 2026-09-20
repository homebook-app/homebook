using System.Runtime.CompilerServices;
using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Options;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

namespace HomeBook.Frontend;

public static class HomeBookBuilder
{
    private static readonly ConditionalWeakTable<WebAssemblyHostBuilder, HomeBookOptions> _options = new();

    /// <summary>
    /// default HomeBook configuration
    /// </summary>
    /// <param name="builder"></param>
    /// <returns></returns>
    public static HomeBookOptions HomeBook(this WebAssemblyHostBuilder builder) =>
        _options.GetValue(builder, _ => new HomeBookOptions());

    public static void BuildHomeBook(this WebAssemblyHostBuilder builder)
    {
        HomeBookOptions options = builder.HomeBook();

        if (builder.HomeBook().StartMenuBuilder is IStartMenuRegistrator smr)
        {
            smr.RegisterStartMenuItems(
                builder.Services,
                builder.Configuration);
        }
    }
}
