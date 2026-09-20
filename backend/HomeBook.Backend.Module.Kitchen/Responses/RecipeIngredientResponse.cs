using System.Diagnostics;

namespace HomeBook.Backend.Module.Kitchen.Responses;

[DebuggerDisplay("{Quantity} {Unit} {Name}")]
public record RecipeIngredientResponse(
    Guid Id,
    string Name,
    string? NormalizedName,
    double? Quantity,
    string? Unit);
