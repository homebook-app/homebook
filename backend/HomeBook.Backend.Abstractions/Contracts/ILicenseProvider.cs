using HomeBook.Backend.Abstractions.Models;

namespace HomeBook.Backend.Abstractions.Contracts;

public interface ILicenseProvider
{
    Task<DependencyLicense[]> GetLicensesAsync(CancellationToken cancellationToken);

    Task MarkLicenseAsAcceptedAsync(CancellationToken cancellationToken);
}
