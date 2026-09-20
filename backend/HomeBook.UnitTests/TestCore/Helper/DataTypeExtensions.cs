using System.Globalization;

namespace HomeBook.UnitTests.TestCore.Helper;

public static class DataTypeExtensions
{
    public static decimal[] ToDecimalArray(this string csv, CultureInfo ci)
    {
        if (string.IsNullOrWhiteSpace(csv))
            return [];

        if (csv.Contains(',') == false)
            return
            [
                decimal.Parse(csv.Trim())
            ];

        return csv.Split(',')
            .Select(x => decimal.Parse(x.Trim(), ci))
            .ToArray();
    }
}
