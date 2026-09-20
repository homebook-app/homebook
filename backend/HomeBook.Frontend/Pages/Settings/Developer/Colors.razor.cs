using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.Pages.Settings.Developer;

public partial class Colors : ComponentBase
{
    private readonly List<string> _brandColors =
    [
        // modern colors
        "brand-github", "brand-docker", "brand-ubuntu",
    ];

    private readonly List<string> _availableColors =
    [
        // modern colors
        "amber", "amethyst", "apple", "aqua", "azure", "caramel", "cerulean", "charcoal", "chartreuse", "coral", "crimson",
        "denim", "emerald", "fern", "gold", "graphite", "honey", "jade", "lavender", "lemon", "mulberry", "peach",
        "petrol", "plum", "rose", "ruby", "shadow", "smoke", "spring", "steel", "stone", "storm", "sunset", "teal",
        "wine", "ocean"
    ];
}
