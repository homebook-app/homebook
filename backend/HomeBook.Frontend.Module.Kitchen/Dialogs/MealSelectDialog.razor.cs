using HomeBook.Frontend.Module.Kitchen.Mappings;
using HomeBook.Frontend.Module.Kitchen.Models;
using HomeBook.Frontend.Module.Kitchen.ViewModels;
using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace HomeBook.Frontend.Module.Kitchen.Dialogs;

public partial class MealSelectDialog : ComponentBase
{
    [CascadingParameter]
    private IMudDialogInstance MudDialog { get; set; }

    private List<RecipeViewModel> _mealItems = [];
    private bool _isLoading { get; set; }
    private CancellationTokenSource _cancellationTokenSource = new();
    private Timer? _searchInputDebounceTimer;

    private MudTextField<string>? _searchTextField;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!firstRender)
            return;

        await SearchAsync();
    }

    private string? _searchText;

    private void OnSearchTextFieldValueChanged(string? value)
    {
        _searchText = value;

        // Reset existing timer if any
        _searchInputDebounceTimer?.Dispose();

        // Create new timer with 3 seconds delay
        long delayMilliseconds = 1000;
        _searchInputDebounceTimer = new Timer(SearchInputDebounceTimerCallback,
            null,
            TimeSpan.FromMilliseconds(delayMilliseconds),
            Timeout.InfiniteTimeSpan);
    }

    private async void SearchInputDebounceTimerCallback(object? state)
    {
        await InvokeAsync(async () =>
        {
            _searchInputDebounceTimer = null;

            await SearchAsync(_searchText ?? string.Empty);
        });
    }

    private async Task SearchAsync(string? searchText = null)
    {
        CancellationToken cancellationToken = _cancellationTokenSource.Token;

        _isLoading = true;
        StateHasChanged();

        try
        {
            // Check if cancelled before starting
            cancellationToken.ThrowIfCancellationRequested();

            IEnumerable<RecipeDto> meals = await RecipeService.GetRecipesAsync(searchText,
                cancellationToken);

            _mealItems.Clear();
            _mealItems.AddRange(meals
                .Select(x => x.ToViewModel()));

            StateHasChanged();
        }
        catch (OperationCanceledException)
        {
            // Search was cancelled, do nothing
            return;
        }
        catch (Exception)
        {
            // TODO: display error message
        }
        finally
        {
            // Only update loading state if this operation wasn't cancelled
            if (!cancellationToken.IsCancellationRequested)
            {
                _isLoading = false;
                StateHasChanged();
            }

            if (_searchTextField is not null)
                await _searchTextField.FocusAsync();
            StateHasChanged();
        }
    }

    private async Task SelectMealAsync(RecipeViewModel meal)
    {
        await ShutdownAsync();

        MudDialog.Close(DialogResult.Ok(meal));
    }

    private async Task CancelAsync()
    {
        await ShutdownAsync();

        MudDialog.Cancel();
    }

    private async Task ShutdownAsync()
    {
        await _cancellationTokenSource.CancelAsync();
        _cancellationTokenSource.Dispose();

        // Cleanup timer
        if (_searchInputDebounceTimer is not null)
            await _searchInputDebounceTimer.DisposeAsync();
    }

    private async Task CreateAsNewMeal()
    {
        string? mealName = _searchText?.Trim();

        if (string.IsNullOrWhiteSpace(mealName))
            return;

        CancellationToken cancellationToken = _cancellationTokenSource.Token;
        await RecipeService.CreateRecipeAsync(mealName,
            cancellationToken);

        // reload
        await SearchAsync(mealName);
    }
}
