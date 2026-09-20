using System.Text;

namespace HomeBook.Frontend.Services.Extensions;

public static class StringExtensions
{
    public static string ToCssClass(this string? val)
    {
        if (string.IsNullOrEmpty(val))
            return string.Empty;

        StringBuilder result = new();

        for (int i = 0; i < val.Length; i++)
        {
            char c = val[i];

            // Add hyphen before uppercase letters (except for the first character)
            if (char.IsUpper(c) && i > 0)
            {
                result.Append('-');
            }

            // Convert to lowercase and append
            result.Append(char.ToLower(c));
        }

        return result.ToString();
    }
}
