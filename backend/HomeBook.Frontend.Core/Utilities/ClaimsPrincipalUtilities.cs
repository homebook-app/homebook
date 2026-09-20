using System.Security.Claims;

namespace HomeBook.Frontend.Core.Utilities;

public static class ClaimsPrincipalUtilities
{
    public static Guid GetUserId(this ClaimsPrincipal claimsPrincipal)
    {
        string? userIdClaim = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim)
            || !Guid.TryParse(userIdClaim, out Guid userId))
            throw new ArgumentException("Invalid or missing UserId claim");

        return userId;
    }
}
