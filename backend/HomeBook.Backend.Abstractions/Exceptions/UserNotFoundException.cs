namespace HomeBook.Backend.Abstractions.Exceptions;

public class UserNotFoundException(string message) : Exception(message);
