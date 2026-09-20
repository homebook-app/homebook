using HomeBook.Backend.Abstractions.Models.UserManagement;

namespace HomeBook.Backend.Core.DataProvider.Mappings;

public static class UserMappings
{
    public static UserInfo ToUserInfo(this Data.Entities.User x) =>
        new(x.Id,
            x.Username,
            x.Created,
            x.Disabled,
            x.IsAdmin);

    public static Data.Entities.User Update(this Data.Entities.User user, UserInfo x)
    {
        user.Username = x.Username;
        user.Created = x.Created;
        user.Disabled = x.Disabled;
        user.IsAdmin = x.IsAdmin;

        return user;
    }
}
