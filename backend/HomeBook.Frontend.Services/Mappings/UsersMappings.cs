using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Abstractions.Models.System;

namespace HomeBook.Frontend.Services.Mappings;

public static class UsersMappings
{
    public static PagedList<UserData> ToPagedResult(this UsersResponse response)
    {
        PagedList<UserData> page = new(response.Page ?? 0,
            response.PageSize ?? 0,
            response.TotalCount ?? 0,
            response.TotalPages ?? 0,
            (response.Users ?? []).Select(x => x.ToUserData()).ToList());

        return page;
    }

    public static UserData ToUserData(this UserResponse response)
    {
        return new UserData(response.Id!.Value,
            response.Username!,
            response.Created!.Value.UtcDateTime,
            response.Disabled?.UtcDateTime,
            response.IsAdmin!.Value);
    }
}
