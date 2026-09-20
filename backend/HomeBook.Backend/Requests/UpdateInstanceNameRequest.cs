using System.ComponentModel.DataAnnotations;

namespace HomeBook.Backend.Requests;

/// <summary>
/// Request model for updating the instance name
/// </summary>
/// <param name="Name">The new instance name</param>
public record UpdateInstanceNameRequest([Required] string Name);
