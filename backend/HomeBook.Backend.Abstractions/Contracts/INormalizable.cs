namespace HomeBook.Backend.Abstractions.Contracts;

public interface INormalizable
{
    void Normalize(IStringNormalizer normalizer);
}
