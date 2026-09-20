using HomeBook.Frontend.Module.Kitchen.Enums;
using HomeBook.Frontend.Module.Kitchen.ViewModels;

namespace HomeBook.Frontend.Module.Kitchen.Models;

public record MealPlanChangedDto(
    MealPlanChangedAction Action,
    RecipeViewModel? Recipe,
    MealType MealType,
    DateOnly Date);
