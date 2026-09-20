namespace HomeBook.Frontend.Services.Exceptions;

public class SetupException(string message, Exception? innerException = null) : Exception(message, innerException)
{

}
