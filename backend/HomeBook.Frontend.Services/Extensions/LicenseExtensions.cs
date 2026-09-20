using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Models;

namespace HomeBook.Frontend.Services.Extensions;

public static class LicenseExtensions
{
    public static License ToLicense(this DependencyLicense license)
    {
        return new License(license?.Name ?? string.Empty,
            license?.Content ?? string.Empty);
    }
}
