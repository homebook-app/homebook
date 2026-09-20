using System.Security.Claims;
using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Abstractions.Models.System;
using HomeBook.Frontend.UI.Resources;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Authorization;
using MudBlazor;

namespace HomeBook.Frontend.Pages.Settings.User;

public partial class Overview : ComponentBase
{
    private bool _loading = true;
    private List<UserData> _users = new();
    private int _currentPage = 1;
    private int _pageSize = 10;
    private int _totalCount;
    private int _totalPages;

    private readonly string[] _pageSizeOptions =
    [
        "5",
        "10",
        "25",
        "50"
    ];

    private Guid? _currentUserId;

    protected override async Task OnInitializedAsync()
    {
        await LoadCurrentUserAsync();
        await LoadUsersAsync();
    }

    private async Task LoadCurrentUserAsync()
    {
        try
        {
            AuthenticationState authState = await AuthenticationStateProvider.GetAuthenticationStateAsync();
            if (authState.User.Identity?.IsAuthenticated == true)
            {
                Claim? userIdClaim = authState.User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out Guid userId))
                {
                    _currentUserId = userId;
                }
            }
        }
        catch (Exception err)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_User_Overview_LoadCurrentUserError_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
    }

    private async Task LoadUsersAsync()
    {
        try
        {
            _loading = true;
            PagedList<UserData>? response =
                await UserManagementProvider.GetAllUsersAsync((ushort)_currentPage,
                    (ushort)_pageSize,
                    CancellationToken.None);
            if (response is not null)
            {
                _users = response.Items.ToList();
                _totalCount = response.TotalCount;
                _totalPages = response.TotalPages;
            }
        }
        catch (Exception err)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_User_Overview_LoadAllUsersError_MessageTemplate)],
                    err.Message),
                Severity.Error);
            _users = [];
        }
        finally
        {
            _loading = false;
        }
    }

    private async Task OnPageChangedAsync(int page)
    {
        _currentPage = page;
        await LoadUsersAsync();
    }

    private async Task OnPageSizeChangedAsync(string pageSizeString)
    {
        if (int.TryParse(pageSizeString, out int newPageSize))
        {
            _pageSize = newPageSize;
            _currentPage = 1; // Reset to first page when changing page size
            await LoadUsersAsync();
        }
    }

    private void NavigateToAddUser()
    {
        NavigationManager.NavigateTo("/Settings/Users/Add");
    }

    private void NavigateToEditUser(Guid userId)
    {
        NavigationManager.NavigateTo($"/Settings/Users/{userId}");
    }

    private bool IsCurrentUser(Guid userId)
    {
        return _currentUserId.HasValue && _currentUserId.Value == userId;
    }

    private async Task ToggleUserStatusAsync(UserData user)
    {
        if (IsCurrentUser(user.Id))
        {
            Snackbar.Add(Loc[nameof(LocalizationStrings.Settings_User_Overview_OwnUserError_Message)],
                Severity.Warning);
            return;
        }

        try
        {
            if (user.DisabledAt.HasValue)
            {
                // Enable user
                await UserManagementProvider.EnableUserAsync(user.Id, CancellationToken.None);
                Snackbar.Add(string.Format(
                        Loc[nameof(LocalizationStrings.Settings_User_Overview_UserEnabled_MessageTemplate)],
                        user.UserName),
                    Severity.Success);
            }
            else
            {
                // Disable user
                await UserManagementProvider.DisableUserAsync(user.Id, CancellationToken.None);
                Snackbar.Add(string.Format(
                        Loc[nameof(LocalizationStrings.Settings_User_Overview_UserDisabled_MessageTemplate)],
                        user.UserName),
                    Severity.Success);
            }

            // Reload users to reflect the changes
            await LoadUsersAsync();
        }
        catch (Exception err)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_User_Overview_UserUpdatingError_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
    }

    private Color GetUserStatusColor(UserData user) =>
        user.DisabledAt.HasValue
            ? Color.Error
            : Color.Success;

    private string GetUserStatusText(UserData user) =>
        user.DisabledAt.HasValue
            ? Loc[nameof(LocalizationStrings.Settings_User_Overview_UserStatus_Disabled_Text)]
            : Loc[nameof(LocalizationStrings.Settings_User_Overview_UserStatus_Active_Text)];


    private string GetUserRoleText(UserData user) =>
        user.IsAdmin
            ? Loc[nameof(LocalizationStrings.Settings_User_Overview_UserRole_Admin_Text)]
            : Loc[nameof(LocalizationStrings.Settings_User_Overview_UserRole_User_Text)];

    private string GetToggleStatusTooltipText(UserData user) =>
        user.DisabledAt.HasValue
            ? Loc[nameof(LocalizationStrings.Settings_User_Overview_ToggleStatusTooltip_Enable_Text)]
            : Loc[nameof(LocalizationStrings.Settings_User_Overview_ToggleStatusTooltip_Disable_Text)];
}
