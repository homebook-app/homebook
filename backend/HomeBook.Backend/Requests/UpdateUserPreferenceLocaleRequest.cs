using System.ComponentModel.DataAnnotations;

namespace HomeBook.Backend.Requests;

public record UpdateUserPreferenceLocaleRequest([Required] string Locale);
