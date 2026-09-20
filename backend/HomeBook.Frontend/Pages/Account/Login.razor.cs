using HomeBook.Frontend.Abstractions.Enums;
using HomeBook.Frontend.Core.Models.Account;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Authorization;
using MudBlazor;

namespace HomeBook.Frontend.Pages.Account;

public partial class Login : ComponentBase
{
    private string _uiStripeBackgroundClass = "build-mode-alpha";
    private string _accountBackgroundClass = "";
    private string _accountContainerClass = "";
    private readonly LoginModel _loginModel = new();
    private bool _isLoading = false;
    private string _errorMessage = string.Empty;
    private string _homebookInstanceName = string.Empty;

    [Parameter]
    [SupplyParameterFromQuery]
    public string? ReturnUrl { get; set; }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!firstRender)
            return;

        string buildMode = "release";
        _uiStripeBackgroundClass = buildMode switch
        {
            "alpha" => "build-mode-alpha",
            "beta" => "build-mode-beta",
            "release" => "build-mode-release",
            _ => "build-mode-unknown"
        };
        StateHasChanged();
    }

    protected override async Task OnInitializedAsync()
    {
        AuthenticationState authState = await AuthenticationStateProvider.GetAuthenticationStateAsync();
        if (authState.User.Identity?.IsAuthenticated == true)
        {
            NavigationManager.NavigateTo("/");
            return;
        }

        await LoadInstanceInfoAsync();

        await base.OnInitializedAsync();
    }

    private async Task LoadInstanceInfoAsync()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        _homebookInstanceName = await JsLocalStorageProvider.GetItemAsync(JsLocalStorageKeys.HomeBookInstanceName,
            cancellationToken) ?? string.Empty;

        StateHasChanged();
    }

    private async Task HandleLoginAsync()
    {
        _isLoading = true;
        _errorMessage = string.Empty;
        StateHasChanged();

        try
        {
            bool loginSuccessful = await AuthenticationService.LoginAsync(_loginModel.Username, _loginModel.Password);

            if (loginSuccessful)
            {
                Snackbar.Add("Login successful!", Severity.Success);

                // Redirect to return URL or home page
                string redirectUrl = string.IsNullOrEmpty(ReturnUrl) ? "/" : Uri.UnescapeDataString(ReturnUrl);
                NavigationManager.NavigateTo(redirectUrl);
            }
            else
            {
                _errorMessage = "Invalid username or password. Please try again.";
                Snackbar.Add("Login failed!", Severity.Error);
            }
        }
        catch (Exception)
        {
            _errorMessage = "An error occurred during login. Please try again later.";
            Snackbar.Add("Login error occurred!", Severity.Error);
        }
        finally
        {
            _isLoading = false;
            StateHasChanged();
        }
    }
}
