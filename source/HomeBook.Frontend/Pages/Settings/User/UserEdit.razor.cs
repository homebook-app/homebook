using System.Security.Claims;
using HomeBook.Frontend.Abstractions.Models.System;
using HomeBook.Frontend.Core.Models.Settings.Users;
using HomeBook.Frontend.UI.Resources;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Authorization;
using MudBlazor;

namespace HomeBook.Frontend.Pages.Settings.User;

public partial class UserEdit : ComponentBase
{
    [Parameter]
    public Guid UserId { get; set; }

    private UserEditModel? _userModel;
    private UserData? _originalUser;
    private bool _loading = true;
    private bool _saving = false;
    private Guid? _currentUserId;

    // Password visibility toggles
    private bool _showPassword = false;
    private bool _showConfirmPassword = false;
    private InputType _passwordInputType = InputType.Password;
    private InputType _confirmPasswordInputType = InputType.Password;
    private string _passwordIcon = Icons.Material.Filled.VisibilityOff;
    private string _confirmPasswordIcon = Icons.Material.Filled.VisibilityOff;

    private readonly List<BreadcrumbItem> _breadcrumbs = new();

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!firstRender)
            return;

        _breadcrumbs.Clear();
        _breadcrumbs.Add(new BreadcrumbItem(Loc[nameof(LocalizationStrings.Settings_PageTitle)],
            href: "/Settings",
            icon: Icons.Material.Filled.Settings));
        _breadcrumbs.Add(new BreadcrumbItem(Loc[nameof(LocalizationStrings.Settings_User_Overview_PageTitle)],
            href: "/Settings/Users",
            icon: Icons.Material.Filled.People));
        _breadcrumbs.Add(new BreadcrumbItem(Loc[nameof(LocalizationStrings.Settings_User_Edit_PageTitle)],
            href: null,
            disabled: true));

        StateHasChanged();
    }

    protected override async Task OnInitializedAsync()
    {
        await GetCurrentUserIdAsync();
        await LoadUserAsync();
    }

    private async Task GetCurrentUserIdAsync()
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
                    Loc[nameof(LocalizationStrings.Settings_User_Edit_LoadingUserError_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
    }

    private async Task LoadUserAsync()
    {
        try
        {
            _loading = true;

            // Get users and find the specific one
            _originalUser = await UserManagementProvider.GetUserByIdAsync(UserId, CancellationToken.None);

            if (_originalUser != null)
            {
                _userModel = new UserEditModel
                {
                    Username = _originalUser.UserName,
                    Password = string.Empty,
                    ConfirmPassword = string.Empty,
                    IsAdmin = _originalUser.IsAdmin,
                    IsEnabled = !_originalUser.DisabledAt.HasValue
                };
            }
        }
        catch (Exception err)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_User_Edit_GetUserIdError_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
        finally
        {
            _loading = false;
        }
    }

    private bool IsCurrentUser()
    {
        return _currentUserId.HasValue && _currentUserId.Value == UserId;
    }

    private void TogglePasswordVisibility()
    {
        if (_showPassword)
        {
            _showPassword = false;
            _passwordInputType = InputType.Password;
            _passwordIcon = Icons.Material.Filled.VisibilityOff;
        }
        else
        {
            _showPassword = true;
            _passwordInputType = InputType.Text;
            _passwordIcon = Icons.Material.Filled.Visibility;
        }
    }

    private void ToggleConfirmPasswordVisibility()
    {
        if (_showConfirmPassword)
        {
            _showConfirmPassword = false;
            _confirmPasswordInputType = InputType.Password;
            _confirmPasswordIcon = Icons.Material.Filled.VisibilityOff;
        }
        else
        {
            _showConfirmPassword = true;
            _confirmPasswordInputType = InputType.Text;
            _confirmPasswordIcon = Icons.Material.Filled.Visibility;
        }
    }

    private async Task HandleValidSubmitAsync()
    {
        if (_userModel == null
            || _originalUser == null)
            return;

        // Password validation only if password is being changed
        if (!string.IsNullOrWhiteSpace(_userModel.Password))
        {
            if (_userModel.Password != _userModel.ConfirmPassword)
            {
                Snackbar.Add(Loc[nameof(LocalizationStrings.Settings_User_Edit_PasswordsDoNotMatchError_Message)],
                    Severity.Error);
                return;
            }

            int passwordRequiredLenght = 8;
            if (_userModel.Password.Length < passwordRequiredLenght)
            {
                Snackbar.Add(string.Format(
                        Loc[nameof(LocalizationStrings.Settings_User_Edit_PasswordTooShortError_MessageTemplate)],
                        passwordRequiredLenght),
                    Severity.Error);
                return;
            }
        }

        if (string.IsNullOrWhiteSpace(_userModel.Username))
        {
            Snackbar.Add(Loc[nameof(LocalizationStrings.Settings_User_Edit_UsernameRequiredError_Message)],
                Severity.Error);
            return;
        }

        int usernameMinLenght = 5;
        int usernameMaxLenght = 20;
        if (_userModel.Username.Length < usernameMinLenght
            || _userModel.Username.Length > usernameMaxLenght)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_User_Edit_UsernameLengthError_MessageTemplate)],
                    usernameMinLenght,
                    usernameMaxLenght),
                Severity.Error);
            return;
        }

        try
        {
            _saving = true;
            List<string> updateMessages = [];

            // Update username if changed
            if (_userModel.Username != _originalUser.UserName)
            {
                await UserManagementProvider.UpdateUsernameAsync(UserId,
                    _userModel.Username,
                    CancellationToken.None);
                updateMessages.Add("username");
            }

            // Update password if provided
            if (!string.IsNullOrWhiteSpace(_userModel.Password))
            {
                await UserManagementProvider.UpdatePasswordAsync(UserId,
                    _userModel.Password,
                    CancellationToken.None);
                updateMessages.Add("password");
            }

            // Update admin status if changed and not current user
            if (_userModel.IsAdmin != _originalUser.IsAdmin
                && !IsCurrentUser())
            {
                await UserManagementProvider.UpdateAdminFlagAsync(UserId,
                    _userModel.IsAdmin,
                    CancellationToken.None);
                updateMessages.Add("admin status");
            }

            if (updateMessages.Any())
            {
                Snackbar.Add(Loc[nameof(LocalizationStrings.Settings_User_Edit_UpdateSuccess_Message)],
                    Severity.Success);

                // Reload user data
                await LoadUserAsync();
            }
            else
            {
                Snackbar.Add(Loc[nameof(LocalizationStrings.Settings_User_Edit_NoChanges_Message)],
                    Severity.Info);
            }
        }
        catch (Exception err)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_User_Edit_UpdatingError_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
        finally
        {
            _saving = false;
        }
    }

    private async Task OnUserDisabledChanged(bool isEnabled)
    {
        await SetEnabledToAsync(isEnabled);
    }

    private async Task SetEnabledToAsync(bool isEnabled)
    {
        if (_originalUser == null || IsCurrentUser())
            return;

        try
        {
            _saving = true;

            if (isEnabled)
            {
                // Enable user
                await UserManagementProvider.EnableUserAsync(UserId,
                    CancellationToken.None);

                Snackbar.Add(Loc[nameof(LocalizationStrings.Settings_User_Edit_UserEnabledSuccess_Message)],
                    Severity.Success);
            }
            else
            {
                // Disable user
                await UserManagementProvider.DisableUserAsync(UserId,
                    CancellationToken.None);

                Snackbar.Add(Loc[nameof(LocalizationStrings.Settings_User_Edit_UserDisabledSuccess_Message)],
                    Severity.Success);
            }

            // Reload user data
            await LoadUserAsync();
        }
        catch (Exception err)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_User_Edit_User_StatusUpdatingError_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
        finally
        {
            _saving = false;
        }
    }

    private async Task ShowDeleteConfirmationAsync()
    {
        if (_originalUser == null || IsCurrentUser())
            return;

        bool? result = await DialogService.ShowMessageBoxAsync(
            Loc[nameof(LocalizationStrings.Settings_User_Edit_DeleteUserDialog_Title)],
            string.Format(Loc[nameof(LocalizationStrings.Settings_User_Edit_DeleteUserDialog_MessageTemplate)],
                _originalUser.UserName),
            yesText: Loc[nameof(LocalizationStrings.Settings_User_Edit_DeleteUserDialog_YesText)],
            cancelText: Loc[nameof(LocalizationStrings.Settings_User_Edit_DeleteUserDialog_CancelText)]);

        if (result == true)
        {
            await DeleteUserAsync();
        }
    }

    private async Task DeleteUserAsync()
    {
        if (_originalUser == null)
            return;

        try
        {
            _saving = true;

            await UserManagementProvider.DeleteUserAsync(UserId,
                CancellationToken.None);

            Snackbar.Add(Loc[nameof(LocalizationStrings.Settings_User_Edit_UserDeleteSuccess_Message)],
                Severity.Success);

            NavigateBack();
        }
        catch (Exception err)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_User_Edit_User_DeletingError_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
        finally
        {
            _saving = false;
        }
    }

    private void NavigateBack() => NavigationManager.NavigateTo("/Settings/Users");
}
