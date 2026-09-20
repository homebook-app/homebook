using HomeBook.Client.Models;
using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Abstractions.Models;
using HomeBook.Frontend.Core.Models.Setup;
using HomeBook.Frontend.Mappings;
using HomeBook.Frontend.Services.Exceptions;
using HomeBook.Frontend.Setup.Exceptions;
using HomeBook.Frontend.UI.Resources;
using Microsoft.AspNetCore.Components;
using Microsoft.Kiota.Abstractions;

namespace HomeBook.Frontend.Setup.SetupSteps;

public partial class DatabaseConfigurationSetupStep : ComponentBase, ISetupStep
{
    private bool _isChecking = false;
    private bool _databaseIsOk = false;
    private string? _errorMessage = null;
    private string _databaseType = string.Empty;
    private DatabaseConfigurationViewModel _databaseConfig = new();

    public string Key { get; } = nameof(DatabaseConfigurationSetupStep);
    public bool HasError { get; set; }
    public bool IsSuccessful { get; set; }
    public Task HandleStepAsync() => throw new NotImplementedException();

    public Task<bool> IsStepDoneAsync(CancellationToken cancellationToken) => throw new NotImplementedException();

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!firstRender)
            return;

        try
        {
            CancellationToken cancellationToken = CancellationToken.None;

            DatabaseConfiguration? databaseConfiguration = await DatabaseSetupService
                .GetDatabaseConfigurationAsync(cancellationToken);
            _databaseConfig = databaseConfiguration?.ToViewModel() ?? new DatabaseConfigurationViewModel();
        }
        catch (InvalidConfigurationException err)
        {
            _errorMessage = err.Message;
        }
        catch (SetupException err)
        {
            _errorMessage = err.Message;
        }
        catch (Exception err)
        {
            _errorMessage = err.Message;
        }
        finally
        {
            StateHasChanged();
        }
    }

    private async Task OnValidSubmit()
    {
        CancellationToken cancellationToken = CancellationToken.None;

        _isChecking = true;
        _databaseIsOk = false;
        _errorMessage = null;
        await InvokeAsync(StateHasChanged);

        try
        {
            await Task.WhenAll(
                Task.Delay(2000, cancellationToken),
                ConnectToDatabaseAsync(cancellationToken));

            _databaseIsOk = true;
        }
        catch (HttpRequestException)
        {
            _errorMessage = Loc[nameof(LocalizationStrings.Setup_BackendConnectionFailed_Message)];
            await StepErrorAsync(cancellationToken);
        }
        catch (SetupCheckException err)
        {
            _errorMessage = err.Message;
            await StepErrorAsync(cancellationToken);
        }
        catch (Exception err)
        {
            _errorMessage = string.Format(Loc[nameof(LocalizationStrings.Setup_Database_UnknownError_MessageTemplate)],
                err.Message);
            await StepErrorAsync(cancellationToken);
        }
        finally
        {
            _isChecking = false;
            await InvokeAsync(StateHasChanged);
        }
    }

    private async Task ConnectToDatabaseAsync(CancellationToken cancellationToken)
    {
        try
        {
            string? databaseType = await BackendClient.Setup.Database.Check.PostAsync(
                new CheckDatabaseRequest
                {
                    DatabaseHost = _databaseConfig.Host,
                    DatabasePort = _databaseConfig.Port,
                    DatabaseName = _databaseConfig.DatabaseName,
                    DatabaseUserName = _databaseConfig.Username,
                    DatabaseUserPassword = _databaseConfig.Password
                },
                x =>
                {
                },
                cancellationToken);

            if (databaseType is null)
                throw new SetupCheckException(
                    Loc[nameof(LocalizationStrings.Setup_Database_Check_NotAvailableOrSupportedError_Message)]);

            _databaseType = databaseType;
        }
        catch (ApiException err) when (err.ResponseStatusCode == 500)
        {
            throw new SetupCheckException(
                Loc[nameof(LocalizationStrings.Setup_Database_Check_UnknownError_Message)]);
        }
        catch (ApiException err) when (err.ResponseStatusCode == 503)
        {
            throw new SetupCheckException(
                Loc[nameof(LocalizationStrings.Setup_Database_Check_NotAvailableError_Message)]);
        }
        catch (Exception err)
        {
            throw new SetupCheckException(err.Message);
        }
    }

    private async Task StepErrorAsync(CancellationToken cancellationToken = default)
    {
        await SetupService.SetStepStatusAsync(false, true, cancellationToken);
    }

    private async Task StepSuccessAsync(CancellationToken cancellationToken = default)
    {
        await SetupService.SetStepStatusAsync(true, false, cancellationToken);
    }

    private async Task OnCountdownFinishedAsync()
    {
        if (!_databaseIsOk)
            return;

        CancellationToken cancellationToken = CancellationToken.None;

        await SetupService.SetStorageValueAsync("DATABASE_TYPE", _databaseType, cancellationToken);
        await SetupService.SetStorageValueAsync("DATABASE_HOST", _databaseConfig.Host, cancellationToken);
        await SetupService.SetStorageValueAsync("DATABASE_PORT", _databaseConfig.Port, cancellationToken);
        await SetupService.SetStorageValueAsync("DATABASE_NAME", _databaseConfig.DatabaseName, cancellationToken);
        await SetupService.SetStorageValueAsync("DATABASE_USERNAME", _databaseConfig.Username, cancellationToken);
        await SetupService.SetStorageValueAsync("DATABASE_PASSWORD", _databaseConfig.Password, cancellationToken);

        await StepSuccessAsync(cancellationToken);
        await InvokeAsync(StateHasChanged);
    }
}
