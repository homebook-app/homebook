namespace HomeBook.Frontend.Module.Kitchen.Models;

public record RecipeStepDto(
    string Description,
    int Position,
    int? TimerDurationInSeconds);
