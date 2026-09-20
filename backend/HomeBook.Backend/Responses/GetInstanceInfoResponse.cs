namespace HomeBook.Backend.Responses;

/// <summary>
/// Response model for instance information
/// </summary>
/// <param name="Name">The instance name</param>
/// <param name="DefaultLocale">The default locale of the instance</param>
public record GetInstanceInfoResponse(string Name, string DefaultLocale);
