using System.Diagnostics;

namespace HomeBook.Backend.Module.Kitchen.Responses;

[DebuggerDisplay("{Description}")]
public record RecipeStepResponse(
    Guid RecipeId,
    int Position,
    string Description,
    int? TimerDurationInSeconds = null);
