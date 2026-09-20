using HomeBook.Frontend.Core.Models.Widgets;
using HomeBook.Frontend.Modules.Abstractions;
using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace HomeBook.Frontend.Pages;

public partial class Start : ComponentBase
{
    private bool _widgetMenuEnabled;
    private bool _open;

    protected override async Task OnInitializedAsync()
    {
        _widgetMenuEnabled = await FeatureManager.IsEnabledAsync("WidgetMenu");
    }

    private void OpenDrawer()
    {
        _open = true;
    }

    private void ItemUpdated(MudItemDropInfo<WidgetConfiguration> dropItem)
    {
        dropItem.Item.Identifier = dropItem.DropzoneIdentifier;
    }

    private List<WidgetConfiguration> _items = new()
    {
        new WidgetConfiguration(typeof(Module.PlatformInfo.Widgets.VersionWidget),
            WidgetSize.Size2x1,
            new Dictionary<string, object>()
            {
                {
                    "IsPreview", true
                }
            },
            "Enterprise",
            "BLUE"),
        new WidgetConfiguration(typeof(Module.PlatformInfo.Widgets.VersionWidget),
            WidgetSize.Size2x1,
            new Dictionary<string, object>()
            {
                {
                    "IsPreview", true
                }
            },
            "Enterprise",
            "BLUE"),
        new WidgetConfiguration(typeof(Module.PlatformInfo.Widgets.VersionWidget),
            WidgetSize.Size2x1,
            new Dictionary<string, object>()
            {
                {
                    "IsPreview", false
                }
            },
            "Enterprise",
            "RED"),
        new WidgetConfiguration(typeof(Module.PlatformInfo.Widgets.VersionWidget),
            WidgetSize.Size2x1,
            new Dictionary<string, object>()
            {
                {
                    "IsPreview", false
                }
            },
            "Enterprise",
            "RED"),
    };
}
