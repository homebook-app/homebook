namespace HomeBook.Frontend.Core.Models.Setup;

public class LicenseViewModel(string name, string htmlContent)
{
    public string Name { get; set; } = name;
    public string HtmlContent { get; set; } = htmlContent;
}
