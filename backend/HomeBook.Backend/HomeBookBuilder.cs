using System.Runtime.CompilerServices;
using HomeBook.Backend.Options;

namespace HomeBook.Backend;

public static class HomeBookBuilder
{
    private static readonly ConditionalWeakTable<WebApplicationBuilder, HomeBookOptions> _options = new();

    /// <summary>
    /// default HomeBook configuration
    /// </summary>
    /// <param name="builder"></param>
    /// <returns></returns>
    public static HomeBookOptions HomeBook(this WebApplicationBuilder builder) =>
        _options.GetValue(builder, _ => new HomeBookOptions());

    public static void BuildHomeBook(this WebApplicationBuilder builder)
    {
        HomeBookOptions options = builder.HomeBook();

        // if (builder.HomeBook().StartMenuBuilder is IStartMenuRegistrator smr)
        // {
        //     smr.RegisterStartMenuItems(
        //         builder.Services,
        //         builder.Configuration);
        // }
    }
}
