namespace HomeBook.Frontend.Abstractions.Models;

public record DatabaseConfiguration(string Host,
    ushort Port,
    string DatabaseName,
    string Username,
    string Password);
