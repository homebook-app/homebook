using HomeBook.Frontend.Core.Models.Settings.Users;
using HomeBook.Frontend.UI.Resources;
using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace HomeBook.Frontend.Pages.Settings.User;

public partial class UserAdd : ComponentBase
{
    private readonly UserAddModel _userModel = new();
    private bool _saving = false;

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
        _breadcrumbs.Add(new BreadcrumbItem(Loc[nameof(LocalizationStrings.Settings_User_Add_PageTitle)],
            href: null,
            disabled: true));

        StateHasChanged();
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
        // Manual validation for password confirmation
        if (_userModel.Password != _userModel.ConfirmPassword)
        {
            Snackbar.Add(Loc[nameof(LocalizationStrings.Settings_User_Add_PasswordsDoNotMatchError_Message)],
                Severity.Error);
            return;
        }

        if (string.IsNullOrWhiteSpace(_userModel.Password))
        {
            Snackbar.Add(Loc[nameof(LocalizationStrings.Settings_User_Add_PasswordRequiredError_MessageTemplate)],
                Severity.Error);
            return;
        }

        if (string.IsNullOrWhiteSpace(_userModel.Username))
        {
            Snackbar.Add(Loc[nameof(LocalizationStrings.Settings_User_Add_UsernameRequiredError_Message)],
                Severity.Error);
            return;
        }

        int usernameMinLenght = 5;
        int usernameMaxLenght = 20;
        if (_userModel.Username.Length < 5 || _userModel.Username.Length > 20)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_User_Add_UsernameLengthError_MessageTemplate)],
                    usernameMinLenght,
                    usernameMaxLenght),
                Severity.Error);
            return;
        }

        int passwordRequiredLenght = 8;
        if (_userModel.Password.Length < 8)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_User_Add_PasswordTooShortError_MessageTemplate)],
                    passwordRequiredLenght),
                Severity.Error);
            return;
        }

        try
        {
            _saving = true;

            Guid? createdUserId = await UserManagementProvider.CreateUserAsync(_userModel.Username,
                _userModel.Password,
                _userModel.IsAdmin,
                CancellationToken.None);

            if (createdUserId is null)
            {
                Snackbar.Add(string.Format(
                        Loc[nameof(LocalizationStrings.Settings_User_Add_UserCouldNotCreatedError_MessageTemplate)],
                        _userModel.Username),
                    Severity.Error);
                return;
            }

            NavigationManager.NavigateTo($"/Settings/Users/{createdUserId}");
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_User_Add_UserCreatedSuccess_MessageTemplate)],
                    _userModel.Username),
                Severity.Error);
        }
        catch (Exception err)
        {
            Snackbar.Add(string.Format(
                    Loc[nameof(LocalizationStrings.Settings_User_Add_CreationUnknownError_MessageTemplate)],
                    err.Message),
                Severity.Error);
        }
        finally
        {
            _saving = false;
        }
    }

    private void NavigateBack()
    {
        NavigationManager.NavigateTo("/Settings/Users");
    }

}
