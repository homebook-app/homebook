using HomeBook.Backend.Abstractions.Contracts;

namespace HomeBook.UnitTests.TestCore.Backend.Core.Setup;

/// <inheritdoc />
public class TestUpdateMigrator(string version, string description) : IUpdateMigrator
{
    /// <inheritdoc />
    public Version Version { get; } = new(version);

    /// <inheritdoc />
    public string Description { get; } = description;

    /// <inheritdoc />
    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
    }

    public override string ToString() => $"{Version} - {Description}";
}
