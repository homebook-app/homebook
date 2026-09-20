namespace HomeBook.Backend.Requests;

public class UpdateUsernameRequest
{
    /// <summary>
    /// The new username to be set for the user.
    /// </summary>
    public string NewUsername { get; set; } = string.Empty;
}
