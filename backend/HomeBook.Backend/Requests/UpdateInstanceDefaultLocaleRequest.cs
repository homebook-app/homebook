using System.ComponentModel.DataAnnotations;

namespace HomeBook.Backend.Requests;

public record UpdateInstanceDefaultLocaleRequest([Required] string Locale);
