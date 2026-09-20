using FluentValidation;
using HomeBook.Backend.Abstractions.Models;
using Homebook.Backend.Core.Setup.Extensions;

namespace Homebook.Backend.Core.Setup.Validators;

public class SetupConfigurationValidator : AbstractValidator<SetupConfiguration>
{
    private static readonly string[] ValidDatabaseTypes =
    [
        "MYSQL",
        "POSTGRESQL",
        "SQLITE"
    ];

    public SetupConfigurationValidator()
    {
        // DatabaseType validation - must be MYSQL, POSTGRESQL or SQLITE in uppercase
        RuleFor(x => x.DatabaseType)
            .NotEmpty()
            .WithMessage("DatabaseType is required")
            .Must(databaseType =>
                !string.IsNullOrEmpty(databaseType) && ValidDatabaseTypes.Contains(databaseType.ToUpper()))
            .WithMessage("DatabaseType must be one of: MYSQL, POSTGRESQL, SQLITE");

        // Always required fields
        RuleFor(x => x.HomebookUserName)
            .NotEmpty()
            .WithMessage("HomebookUserName is required");

        RuleFor(x => x.HomebookUserPassword)
            .NotEmpty()
            .WithMessage("HomebookUserPassword is required");

        RuleFor(x => x.HomebookConfigurationName)
            .NotEmpty()
            .WithMessage("HomebookConfigurationName is required");

        RuleFor(x => x.HomebookConfigurationDefaultLocale)
            .NotEmpty()
            .WithMessage("HomebookConfigurationDefaultLanguage is required");

        // SQLite specific validation
        RuleFor(x => x.DatabaseFile)
            .NotEmpty()
            .WithMessage("DatabaseFile is required")
            .WhenFileBasedDatabase();

        // Non-SQLite database validation (MYSQL, POSTGRESQL)
        RuleFor(x => x.DatabaseHost)
            .NotEmpty()
            .WithMessage("DatabaseHost is required")
            .WhenServerDatabase();

        RuleFor(x => x.DatabasePort)
            .NotNull()
            .WithMessage("DatabasePort is required")
            .WhenServerDatabase();

        RuleFor(x => x.DatabaseName)
            .NotEmpty()
            .WithMessage("DatabaseName is required")
            .WhenServerDatabase();

        RuleFor(x => x.DatabaseUserName)
            .NotEmpty()
            .WithMessage("DatabaseUserName is required")
            .WhenServerDatabase();

        RuleFor(x => x.DatabaseUserPassword)
            .NotEmpty()
            .WithMessage("DatabaseUserPassword is required")
            .WhenServerDatabase();
    }
}
