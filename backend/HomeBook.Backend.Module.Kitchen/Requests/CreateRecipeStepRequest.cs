namespace HomeBook.Backend.Module.Kitchen.Requests;

public record CreateRecipeStepRequest(
    string Description,
    int Position,
    int? TimerDurationInSeconds);
