using HomeBook.Client.Models;
using HomeBook.Frontend.Core.Models.Setup;

namespace HomeBook.Frontend.Mappings;

public static class LocaleMappings
{
    public static LanguageViewModel ToViewModel(this LocaleResponse locale)
    {
        return new LanguageViewModel(locale.Code ?? string.Empty,
            locale.Name ?? string.Empty);
    }
}
