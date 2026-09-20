using HomeBook.Backend.Abstractions.Contracts;
using HomeBook.Backend.Abstractions.Models.UserManagement;
using Microsoft.Extensions.Logging;

namespace Homebook.Backend.Core.Setup.UpdateMigrators;

public class Update_20250912_01(
    ILogger<Update_20250912_01> logger,
    IUserProvider userProvider) : IUpdateMigrator
{
    /// <inheritdoc />
    public Version Version { get; } = new(1, 0, 11);

    /// <inheritdoc />
    public string Description { get; } = "Add IsAdmin to oldest homebook user";

    /// <inheritdoc />
    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        // update users and add created timestamp
        logger.LogInformation("Updating existing users");

        IEnumerable<UserInfo> users = await userProvider.GetAllAsync(cancellationToken);
        UserInfo oldestUser = users.Where(x => x.Disabled is null)
            .OrderBy(x => x.Created)
            .First();

        await userProvider.UpdateAdminFlag(oldestUser.Id,
            true,
            cancellationToken);
    }
}
