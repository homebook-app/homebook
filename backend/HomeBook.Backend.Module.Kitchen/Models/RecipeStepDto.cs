namespace HomeBook.Backend.Module.Kitchen.Models;

public record RecipeStepDto(
    Guid RecipeId,
    int Position,
    string Description,
    int? TimerDurationInSeconds);
