namespace HomeBook.Backend.Responses;

/// <summary>
///
/// </summary>
/// <param name="Locales"></param>
public record GetLocalesResponse(LocaleResponse[] Locales);

/// <summary>
///
/// </summary>
/// <param name="Code"></param>
/// <param name="Name"></param>
public record LocaleResponse(string Code, string Name);
