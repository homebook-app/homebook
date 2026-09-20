using HomeBook.Frontend.Module.Kitchen.Dialogs;
using HomeBook.Frontend.Module.Kitchen.Enums;
using HomeBook.Frontend.Module.Kitchen.Models;
using HomeBook.Frontend.Module.Kitchen.ViewModels;
using HomeBook.Frontend.UI.Utilities;
using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace HomeBook.Frontend.Module.Kitchen.Components;

public partial class UiMealDay : ComponentBase
{
    [Parameter]
    public MealPlanItemViewModel MealPlanItem { get; set; } = null!;

    [Parameter]
    public EventCallback<MealPlanChangedDto> OnMealPlanItemChanged { get; set; }

    protected override async Task OnParametersSetAsync()
    {
        await base.OnParametersSetAsync();

        ArgumentNullException.ThrowIfNull(MealPlanItem, nameof(MealPlanItem));
    }

    protected string HeaderCssClass =>
        new HtmlArgumentBuilder("ui-meal-card")
            .AddClass("border-0")
            .AddClass($"ui-color-bg-gradient-{MealPlanItem!.ColorName}",
                !string.IsNullOrEmpty(MealPlanItem.ColorName))
            .Build();

    private async Task OnMealAdd(MealType mealType, DateOnly date)
    {
        IDialogReference dialogReference = await DialogService.ShowAsync<MealSelectDialog>(
            "+Gericht auswählen",
            new DialogOptions()
            {
                MaxWidth = MaxWidth.Small,
                FullWidth = true,
                CloseOnEscapeKey = true,
                CloseButton = true
            });

        DialogResult? dialogResult = await dialogReference.Result;
        if (dialogResult is null)
            return;

        RecipeViewModel? meal = (dialogResult.Data as RecipeViewModel);
        if (meal is null)
            return;

        // MealPlanItemViewModel? mealPlanItem = _mealPlanItems.FirstOrDefault(item => item.Date == date);
        switch (mealType)
        {
            case MealType.Breakfast:
                MealPlanItem!.Breakfast = meal;
                break;
            case MealType.Lunch:
                MealPlanItem!.Lunch = meal;
                break;
            case MealType.Dinner:
                MealPlanItem!.Dinner = meal;
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(mealType), mealType, null);
        }

        StateHasChanged();

        MealPlanChangedDto dto = new(MealPlanChangedAction.Added,
            meal,
            mealType,
            date);
        await OnMealPlanItemChanged.InvokeAsync(dto);
    }

    private async Task OnMealDelete(MealType mealType, DateOnly date)
    {
        // MealPlanItemViewModel? mealPlanItem = _mealPlanItems.FirstOrDefault(item => item.Date == date);
        switch (mealType)
        {
            case MealType.Breakfast:
                MealPlanItem!.Breakfast = null;
                break;
            case MealType.Lunch:
                MealPlanItem!.Lunch = null;
                break;
            case MealType.Dinner:
                MealPlanItem!.Dinner = null;
                break;
        }

        StateHasChanged();

        MealPlanChangedDto dto = new(MealPlanChangedAction.Removed,
            null,
            mealType,
            date);
        await OnMealPlanItemChanged.InvokeAsync(dto);
    }
}
