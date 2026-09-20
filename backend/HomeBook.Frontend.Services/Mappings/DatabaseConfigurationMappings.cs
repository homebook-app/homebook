using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Models;

namespace HomeBook.Frontend.Services.Mappings;

public static class DatabaseConfigurationMappings
{
    public static DatabaseConfiguration ToDatabaseConfiguration(this GetDatabaseCheckResponse source)
    {
        return new DatabaseConfiguration(source.DatabaseHost ?? string.Empty,
            ushort.TryParse(source.DatabasePort, out ushort port) ? port : (ushort)0,
            source.DatabaseName ?? string.Empty,
            source.DatabaseUserName ?? string.Empty,
            source.DatabaseUserPassword ?? string.Empty);
    }
}
