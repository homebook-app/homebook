using System.Reflection;
using HomeBook.Frontend.Core.Models.Widgets;
using HomeBook.Frontend.Modules.Abstractions;
using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.Components;

public partial class UiWidgetSelector : ComponentBase
{
    private IReadOnlyList<WidgetConfiguration> _availableWidgets = new List<WidgetConfiguration>();

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!firstRender)
            return;

        await LoadWidgetsAsync();
    }

    private async Task LoadWidgetsAsync()
    {
        await Task.CompletedTask;
        CancellationToken cancellationToken = CancellationToken.None;

        IReadOnlyList<Type> widgetTypes = WidgetFactory.GetAllWidgetTypes();
        List<WidgetConfiguration> configurations = [];
        foreach (Type widgetType in widgetTypes)
        {
            WidgetSize[] widgetSizes = (WidgetSize[])widgetType
                .GetProperty(nameof(IWidget.AvailableSizes),
                    BindingFlags.Public | BindingFlags.Static)
                ?.GetValue(null)!;

            Dictionary<string, object> parameters = new()
            {
                {
                    "IsPreview", true
                }
            };

            configurations.AddRange(widgetSizes
                .Select(widgetSize => new WidgetConfiguration(widgetType,
                    widgetSize,
                    parameters,
                    "",
                    "")));
        }

        _availableWidgets = configurations;
        StateHasChanged();
    }
}
