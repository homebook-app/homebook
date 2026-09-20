namespace HomeBook.Frontend.Module.Kitchen.Models;

public record RecipeIngredientDto(
    string Name,
    double? Quantity,
    string? Unit);
