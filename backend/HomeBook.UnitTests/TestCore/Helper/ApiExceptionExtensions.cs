using Microsoft.Kiota.Abstractions;

namespace HomeBook.UnitTests.TestCore.Helper;

public static class ApiExceptionExtensions
{
    public static ApiException WithStatusCode(this ApiException exception, int statusCode)
    {
        exception.ResponseStatusCode = statusCode;
        return exception;
    }
}
