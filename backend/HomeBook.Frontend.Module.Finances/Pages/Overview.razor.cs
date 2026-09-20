using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Core.Icons;
using HomeBook.Frontend.Module.Finances.Resources;
using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.Module.Finances.Pages;

public partial class Overview : ComponentBase
{
    protected override async Task OnInitializedAsync()
    {
        MenuService.UpdateMenuItems([
            new MenuItem(Loc[nameof(Strings.Savings_Title)],
                "/Finances/Savings/Overview",
                HomeBookIcons.Icons8.Windows11.Outline.MoneyBox),
            // new MenuItem("+Konten", "/Finances/BankAccounts", HomeBookIcons.Icons8.Windows11.Outline.CardMagnetic),
            // new MenuItem("+Einstellungen", "/Finances/Settings", HomeBookIcons.Icons8.Windows11.Outline.Gear2),
        ]);

        await base.OnInitializedAsync();
    }
}
