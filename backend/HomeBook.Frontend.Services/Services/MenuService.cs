using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Abstractions.Models;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Routing;

namespace HomeBook.Frontend.Services.Services;

/// <inheritdoc/>
public class MenuService : IMenuService, IDisposable
{
    private readonly NavigationManager _navigationManager;

    private List<MenuItem> _menuItems = [];

    public event EventHandler? OnMenuItemsChanged;

    public MenuService(NavigationManager navigationManager)
    {
        _navigationManager = navigationManager;

        _navigationManager.LocationChanged += NavigationManagerOnLocationChanged;
    }

    public void Dispose()
    {
        _navigationManager.LocationChanged -= NavigationManagerOnLocationChanged;
    }

    private void NavigationManagerOnLocationChanged(object? sender, LocationChangedEventArgs e)
    {
        UpdateMenuItems([]);
    }

    /// <inheritdoc/>
    public void UpdateMenuItems(IEnumerable<MenuItem> menuItems)
    {
        _menuItems.Clear();

        IEnumerable<MenuItem> enumerable = menuItems.ToList();
        if (enumerable.Any())
            _menuItems.AddRange(enumerable);

        OnMenuItemsChanged?.Invoke(this, EventArgs.Empty);
    }

    /// <inheritdoc/>
    public MenuItem[] GetMenuItems() => _menuItems.ToArray();
}
