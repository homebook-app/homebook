namespace HomeBook.Backend.Module.Kitchen.Requests;

public record CreateRecipeIngredientRequest(
    string Name,
    double? Quantity,
    string? Unit);
