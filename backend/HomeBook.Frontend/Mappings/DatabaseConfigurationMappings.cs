using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Core.Models.Setup;

namespace HomeBook.Frontend.Mappings;

public static class DatabaseConfigurationMappings
{
    public static DatabaseConfigurationViewModel ToViewModel(this DatabaseConfiguration source)
    {
        return new DatabaseConfigurationViewModel
        {
            Host = source.Host,
            Port = source.Port,
            DatabaseName = source.DatabaseName,
            Username = source.Username,
            Password = source.Password
        };
    }
}
