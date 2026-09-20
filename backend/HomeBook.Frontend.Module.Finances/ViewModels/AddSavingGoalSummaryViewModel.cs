using System.Globalization;
using HomeBook.Frontend.Abstractions.Contracts;
using HomeBook.Frontend.Module.Finances.Enums;
using HomeBook.Frontend.Module.Finances.Resources;
using Microsoft.Extensions.Localization;
using MudBlazor;

namespace HomeBook.Frontend.Module.Finances.ViewModels;

public class AddSavingGoalSummaryViewModel(
    IStringLocalizer<Strings> Loc,
    IDateTimeProvider DateTime)
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string IconName { get; set; } = string.Empty;
    public InterestRateOptions InterestRateOption { get; set; } = InterestRateOptions.NONE;
    public decimal? InterestRate { get; set; }

    // from response
    public DateTime? TargetDate { get; set; }
    public decimal TargetAmount { get; set; }
    public int NumberOfMonths { get; set; }
    public decimal AmountPerMonth { get; set; }

    public decimal[] AmountsWithInterests = [];

    public decimal[] Interests = [];

    public decimal[] AmountsWithoutInterests =>
        Enumerable.Range(1, NumberOfMonths)
            .Select(m => AmountPerMonth * m)
            .ToArray();

    public ChartOptions ChartOptions = new()
    {
        // YAxisToStringFunc = value => value.ToString("C"),
        // ValueFormatString = "C",
        ShowToolTips = false,
    };

    public List<ChartSeries<double>> ChartSeries =>
    [
        new()
        {
            Name = Loc[nameof(Strings.AddSavingGoalSummary_Total_Name)],
            // LineDisplayType = LineDisplayType.Area,
            Data = TargetDate.HasValue
                ? (AmountsWithInterests ?? [])
                .Select(Convert.ToDouble)
                .ToArray()
                : []
        },
        new()
        {
            Name = Loc[nameof(Strings.AddSavingGoalSummary_Payments_Name)],
            // LineDisplayType = LineDisplayType.Line,
            Data = TargetDate.HasValue
                ? (AmountsWithoutInterests ?? [])
                .Select(Convert.ToDouble)
                .ToArray()
                : []
        },
        // new()
        // {
        //     Name = "+Zinsen",
        //     Data = TargetDate.HasValue
        //         ? (Interests ?? [])
        //         .Select(Convert.ToDouble)
        //         .ToArray()
        //         : []
        // }
    ];

    public string[] YAxisLabels =>
        TargetDate.HasValue
            ? (AmountsWithInterests ?? [])
            .Select(x => x.ToString("C"))
            .ToArray()
            : [];

    public string[] ChartLabels =>
        TargetDate.HasValue
            ? Enumerable.Range(1, NumberOfMonths)
                .Select(i => DateTime.Now.AddMonths(i).ToString("MMM", CultureInfo.CurrentUICulture))
                .ToArray()
            : [];
}
