using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace HomeBook.Frontend.Components;

public enum EasingMode
{
    Linear,
    EaseOutQuad,
    EaseOutCubic,
    EaseOutSine,
    EaseInOutSine
}

public partial class UiCountdownAlert : ComponentBase
{
    private readonly int _refreshRate = 10;

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public Severity Severity { get; set; } = Severity.Normal;

    [Parameter]
    public TimeSpan Duration { get; set; } = TimeSpan.FromSeconds(5);

    [Parameter]
    public Color CountdownColor { get; set; } = Color.Primary;

    [Parameter]
    public EventCallback OnFinished { get; set; }

    [Parameter]
    public EasingMode Easing { get; set; } = EasingMode.EaseOutSine;

    [Parameter]
    public Func<double, double>? EasingFunc { get; set; }

    private double _progress = 0;

    private static double Clamp01(double v) => v < 0 ? 0 : (v > 1 ? 1 : v);

    private double ApplyEasing(double t)
    {
        t = Clamp01(t);
        if (EasingFunc is not null)
            return Clamp01(EasingFunc(t));

        return Easing switch
        {
            EasingMode.Linear => t,
            EasingMode.EaseOutQuad => 1 - (1 - t) * (1 - t),
            EasingMode.EaseOutCubic => 1 - Math.Pow(1 - t, 3),
            EasingMode.EaseOutSine => Math.Sin(t * Math.PI / 2),
            EasingMode.EaseInOutSine => -(Math.Cos(Math.PI * t) - 1) / 2,
            _ => t
        };
    }

    protected override async Task OnInitializedAsync()
    {
        int totalSteps = (int)(Duration.TotalSeconds * _refreshRate);
        int delay = 1000 / _refreshRate;

        for (int i = 0; i <= totalSteps; i++)
        {
            double linear = totalSteps == 0 ? 1 : (double)i / totalSteps; // 0..1
            double eased = ApplyEasing(linear); // 0..1
            _progress = eased * 100; // 0..100
            StateHasChanged();
            await Task.Delay(delay);
        }

        _progress = 100;
        StateHasChanged();

        if (OnFinished.HasDelegate)
            await OnFinished.InvokeAsync();
    }
}
