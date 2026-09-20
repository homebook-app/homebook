namespace HomeBook.Backend.Abstractions.Exceptions;

public class UserAlreadyExistsException(string message) : Exception(message);
