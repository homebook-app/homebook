using System.Security.Claims;

namespace HomeBook.UnitTests.TestCore.Helper;

public static class UserHelper
{
    public static ClaimsPrincipal CreateTestUser(Guid userId,
        string name) =>
        new(new ClaimsIdentity([
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, name)
            ],
            "TestAuthentication"));
}
