namespace HomeBook.Backend.Module.Kitchen.Models;

public record RecipeStepRequestDto(
    string Description,
    int Position,
    int? TimerDurationInSeconds);
