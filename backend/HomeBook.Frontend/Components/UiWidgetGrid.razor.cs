using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace HomeBook.Frontend.Components;

public partial class UiWidgetGrid : ComponentBase
{
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter]
    public bool ShowGridCells { get; set; } = false;

    private ElementReference gridElement;
    private IJSObjectReference? module;
    private IJSObjectReference? gridInstance;
    private DotNetObjectReference<UiWidgetGrid>? objRef;

    private List<GridCell> gridCells = new();
    private List<RenderFragment> childWidgets = new();
    private int columns = 0;
    private int rows = 0;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            // Load the JavaScript module
            module = await JSRuntime.InvokeAsync<IJSObjectReference>("import",
                "./Components/UiWidgetGrid.razor.js");

            // Create .NET object reference for JavaScript callbacks
            objRef = DotNetObjectReference.Create(this);

            // Create JavaScript class instance using factory function
            gridInstance = await module.InvokeAsync<IJSObjectReference>("createUiWidgetGrid");

            // Initialize the grid
            await gridInstance.InvokeVoidAsync("init", gridElement, objRef);
        }
    }

    [JSInvokable]
    public async Task OnGridDimensionsChanged(GridDimensions dimensions)
    {
        columns = dimensions.Cols;
        rows = dimensions.Rows;

        if (ShowGridCells)
        {
            GenerateGridCells();
            await InvokeAsync(StateHasChanged);
        }
    }

    private void GenerateGridCells()
    {
        gridCells.Clear();

        // Generate grid cells based on calculated dimensions
        for (int row = 0; row < rows; row++)
        {
            for (int col = 0; col < columns; col++)
            {
                gridCells.Add(new GridCell
                {
                    Row = row,
                    Column = col,
                    Index = row * columns + col
                });
            }
        }

        // Extract child widgets if ChildContent is provided
        ExtractChildWidgets();
    }
 private void ExtractChildWidgets()
    {
        childWidgets.Clear();

        if (ChildContent != null)
        {
            childWidgets.Add(ChildContent);
        }
    }

    public async ValueTask DisposeAsync()
    {
        // Clean up JavaScript resources
        if (gridInstance != null)
        {
            await gridInstance.InvokeVoidAsync("dispose");
            await gridInstance.DisposeAsync();
        }

        if (module != null)
        {
            await module.DisposeAsync();
        }

        objRef?.Dispose();
    }

    public class GridCell
    {
        public int Row { get; set; }
        public int Column { get; set; }
        public int Index { get; set; }
    }

    public class GridDimensions
    {
        public int Cols { get; set; }
        public int Rows { get; set; }
    }
}
