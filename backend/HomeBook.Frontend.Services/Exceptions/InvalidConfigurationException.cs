namespace HomeBook.Frontend.Services.Exceptions;

public class InvalidConfigurationException(string message, Exception exception) : Exception(message, exception);
