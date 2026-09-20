namespace HomeBook.Frontend.Modules.Abstractions;

public interface IWidget
{
    static abstract WidgetSize[] AvailableSizes { get; }
}
