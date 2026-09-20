using HomeBook.Backend.Abstractions.Contracts;

namespace HomeBook.Backend.Core;

public class StringNormalizer : IStringNormalizer
{
    public string Normalize(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        string normalized = input.Trim().ToLowerInvariant();

        // Replace common diacritics with their base characters
        normalized = RemoveDiacritics(normalized);

        // Replace spaces and underscores with hyphens
        normalized = System.Text.RegularExpressions.Regex.Replace(normalized, @"[\s_]+", "-");

        // Remove any characters that are not alphanumeric or hyphens
        normalized = System.Text.RegularExpressions.Regex.Replace(normalized, @"[^a-z0-9\-]", string.Empty);

        // Remove multiple consecutive hyphens
        normalized = System.Text.RegularExpressions.Regex.Replace(normalized, @"-+", "-");

        // Remove leading and trailing hyphens
        normalized = normalized.Trim('-');

        return normalized;
    }

    private string RemoveDiacritics(string text)
    {
        System.Text.StringBuilder stringBuilder = new();

        foreach (char character in text.Normalize(System.Text.NormalizationForm.FormD))
        {
            System.Globalization.UnicodeCategory unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(character);
            if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(character);
            }
        }

        return stringBuilder.ToString().Normalize(System.Text.NormalizationForm.FormC);
    }
}
