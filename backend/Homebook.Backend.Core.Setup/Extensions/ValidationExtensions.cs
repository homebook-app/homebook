using FluentValidation;
using HomeBook.Backend.Abstractions.Models;

namespace Homebook.Backend.Core.Setup.Extensions;

public static class ValidationExtensions
{
    public static IRuleBuilderOptions<SetupConfiguration, T> WhenFileBasedDatabase<T>(
        this IRuleBuilderOptions<SetupConfiguration, T> rule)
    {
        return rule.When(x => x.DatabaseType.ToUpper() == "SQLITE");
    }

    public static IRuleBuilderOptions<SetupConfiguration, T> WhenServerDatabase<T>(
        this IRuleBuilderOptions<SetupConfiguration, T> rule)
    {
        return rule.When(x => x.DatabaseType.ToUpper() != "SQLITE");
    }
}
