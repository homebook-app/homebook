using HomeBook.Frontend.Abstractions.Models;

namespace HomeBook.Frontend.Abstractions.Contracts;

public interface IMenuService
{
    event EventHandler? OnMenuItemsChanged;
    void UpdateMenuItems(IEnumerable<MenuItem> menuItems);
    MenuItem[] GetMenuItems();
}
