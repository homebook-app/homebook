using System.Globalization;

namespace HomeBook.Frontend.UI.Utilities;

public static class LocalizationCultureMapper
{
    private static readonly Dictionary<string, string> ResourceCultureMap = new()
    {
        { "en-US", "en-EN" },
        { "en-GB", "en-EN" },
        { "de-DE", "de-DE" },
        { "fr-FR", "fr-FR" },
    };

    public static CultureInfo GetResourceCulture(string selectedCulture)
    {
        string normalized = selectedCulture?.Trim() ?? "en-US";
        if (ResourceCultureMap.TryGetValue(normalized, out var mapped))
            return new CultureInfo(mapped);

        return new CultureInfo("en-EN"); // fallback
    }
}
