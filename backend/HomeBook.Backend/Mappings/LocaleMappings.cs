using HomeBook.Backend.Responses;

namespace HomeBook.Backend.Mappings;

public static class LocaleMappings
{
    public static LocaleResponse ToLocalResponse(this string locale)
    {
        string displayName = locale switch
        {
            // Code => Locale Name (English Name)
            "de-DE" => "Deutsch (German)",
            "en-GB" => "English (British English)",
            "en-US" => "English (US English)",
            "fr-FR" => "Français (French)",
            _ => locale // Fallback to the locale code if no display name is found
        };

        return new LocaleResponse(locale, displayName);
    }
}
