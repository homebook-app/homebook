using HomeBook.Frontend.Modules.Abstractions;
using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.Components;

public partial class UiWidgetContainer : ComponentBase
{
    private string _widgetSizeCss = "";

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    private WidgetSize _currentSize = WidgetSize.Size2x2;

    [Parameter]
    public WidgetSize Size
    {
        get => _currentSize;
        set
        {
            if (_currentSize != value)
            {
                _currentSize = value;
                MapWidgetSizeToCssClass();
            }
        }
    }

    private void MapWidgetSizeToCssClass()
    {
        _widgetSizeCss = _currentSize switch
        {
            WidgetSize.Size2x1 => "w-2 h-1",
            WidgetSize.Size2x2 => "w-2 h-2",
            WidgetSize.Size4x2 => "w-4 h-2",
            WidgetSize.Size4x4 => "w-4 h-4",
            WidgetSize.Size8x4 => "w-8 h-4",
            _ => "w-2 h 2"
        };
    }

}
