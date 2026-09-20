using HomeBook.Frontend.Modules.Abstractions;
using Microsoft.AspNetCore.Components;

namespace HomeBook.Frontend.Pages.Settings;

public partial class Modules : ComponentBase
{
    private List<IModule> _registeredModules = [];
    private Dictionary<IModule, IEnumerable<string>> _availableWidgets = [];

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!firstRender)
            return;

        CancellationToken cancellationToken = CancellationToken.None;
        await LoadAsync(cancellationToken);
        StateHasChanged();
    }

    private async Task LoadAsync(CancellationToken cancellationToken)
    {
        await Task.CompletedTask;

        _registeredModules.Clear();
        _registeredModules = RegisteredModules.Select(x => x)
            .ToList();

        _availableWidgets.Clear();
        foreach (IModule module in _registeredModules)
        {
            string moduleId = module.GetType().FullName
                              ?? throw new InvalidOperationException("Module type must have a full name.");
            IReadOnlyList<Type> widgets = WidgetFactory.GetWidgetTypesForModule(moduleId);
            _availableWidgets[module] = widgets.Select(x => x.Name);
        }
    }
}
