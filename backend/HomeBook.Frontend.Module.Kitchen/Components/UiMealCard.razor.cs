using HomeBook.Frontend.Module.Kitchen.ViewModels;
using HomeBook.Frontend.UI.Utilities;
using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.Module.Kitchen.Components;

public partial class UiMealCard : ComponentBase
{
    protected string Style =>
        new HtmlArgumentBuilder("")
            .AddClass($"background-color: color-mix(in srgb, {MealTypeColor}, transparent 75%)")
            .Build();

    protected string CssClass =>
        new HtmlArgumentBuilder("ui-meal-card")
            .AddClass("d-flex flex-column")
            .AddClass(Class, !string.IsNullOrWhiteSpace(Class))
            .Build();

    [Parameter]
    public string MealTypeName { get; set; } = string.Empty;

    [Parameter]
    public string MealTypeIcon { get; set; } = string.Empty;

    [Parameter]
    public string MealTypeColor { get; set; } = string.Empty;

    [Parameter]
    public string Class { get; set; } = string.Empty;

    [Parameter]
    public RecipeViewModel? Meal { get; set; } = null;

    [Parameter]
    public EventCallback OnAdd { get; set; }

    [Parameter]
    public EventCallback OnDelete { get; set; }

    public async Task HandleAddClick()
    {
        if (OnAdd.HasDelegate)
            await OnAdd.InvokeAsync(null);
    }

    protected async Task HandleDeleteClick()
    {
        if (OnDelete.HasDelegate)
            await OnDelete.InvokeAsync(null);
    }
}
