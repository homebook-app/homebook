using System.Reflection;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using MudBlazor;

namespace HomeBook.Frontend.Pages.Settings.Developer;

class IconInfo
{
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public partial class UiIconsList : ComponentBase
{
    [Parameter]
    public Type? IconClass { get; set; }

    [Parameter]
    public string? Name { get; set; }

    private List<IconInfo> _allIcons = new();

    protected override void OnInitialized()
    {
        LoadIconsFromGlassMorphism();
    }

    private void LoadIconsFromGlassMorphism()
    {
        List<IconInfo> icons = [];

        try
        {
            if (IconClass is not null)
            {
                FieldInfo[] iconFields = IconClass.GetFields(BindingFlags.Public | BindingFlags.Static)
                    .Where(f => f.FieldType == typeof(string))
                    .ToArray();

                foreach (FieldInfo field in iconFields)
                {
                    object? value = field.GetValue(null);
                    if (value is string iconValue && !string.IsNullOrEmpty(iconValue))
                    {
                        string iconName = field.Name;
                        string displayName = FormatDisplayName(iconName);

                        icons.Add(new IconInfo
                        {
                            Name = iconName,
                            DisplayName = displayName,
                            Value = iconValue
                        });
                    }
                }
            }
        }
        catch
        {
            // Fallback if reflection fails - empty list
        }

        _allIcons = icons.OrderBy(i => i.DisplayName).ToList();
    }

    private static string FormatDisplayName(string iconName)
    {
        // Convert PascalCase to readable format
        return string.Join(" ",
            iconName
                .Replace("_", " ")
                .Split(' ')
                .Select(word => char.ToUpper(word[0]) + word[1..].ToLower()));
    }

    private async Task CopyIconName(string iconName)
    {
        try
        {
            await JsRuntime.InvokeVoidAsync("navigator.clipboard.writeText", iconName);
            Snackbar.Add($"Icon name '{iconName}' copied to clipboard!", Severity.Success);
        }
        catch
        {
            Snackbar.Add("Failed to copy to clipboard. Please copy manually.", Severity.Error);
        }
    }
}
