namespace HomeBook.Backend.Module.Kitchen.Models;

public record RecipeIngredientRequestDto(
    string Name,
    double? Quantity,
    string? Unit);
