namespace HomeBook.Backend.Module.Kitchen.Models;

public record RecipeIngredientDto(
    Guid Id,
    string Name,
    string NormalizedName,
    double? Quantity,
    string? Unit);
