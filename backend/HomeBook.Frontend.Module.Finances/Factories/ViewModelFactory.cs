using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Module.Finances.Contracts;
using HomeBook.Frontend.Module.Finances.Resources;
using HomeBook.Frontend.Module.Finances.ViewModels;
using Microsoft.Extensions.Localization;

namespace HomeBook.Frontend.Module.Finances.Factories;

/// <inheritdoc/>
public class ViewModelFactory(
    IStringLocalizer<Strings> loc,
    IDateTimeProvider dateTimeProvider) : IViewModelFactory
{
    /// <inheritdoc/>
    public AddSavingGoalSummaryViewModel CreateAddSavingGoalSummaryViewModel() =>
        new(loc,
            dateTimeProvider);
}
