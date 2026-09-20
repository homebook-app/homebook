using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Core.Models.Setup;

namespace HomeBook.Frontend.Mappings;

public static class LicenseViewModelMappings
{
    public static LicenseViewModel ToViewModel(this DependencyLicense license)
    {
        return new LicenseViewModel(license?.Name ?? string.Empty,
            license?.Content ?? string.Empty);
    }

    public static LicenseViewModel ToViewModel(this License license)
    {
        return new LicenseViewModel(license?.Name ?? string.Empty,
            license?.Content ?? string.Empty);
    }
}
