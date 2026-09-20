namespace HomeBook.Backend.Attributes;

/// <summary>
/// Attribute to mark endpoints that require admin authorization
/// </summary>
[AttributeUsage(AttributeTargets.Method)]
public class RequireAdminAttribute : Attribute
{
}
