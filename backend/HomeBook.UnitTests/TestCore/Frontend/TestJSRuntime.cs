using Microsoft.JSInterop;

namespace HomeBook.UnitTests.TestCore.Frontend;

public class TestJSRuntime : IJSRuntime
{
    private readonly Dictionary<string, object?> _setupResults = new();
    private readonly List<(string Identifier, object?[]? Args)> _calledMethods = new();


    /// <summary>
    /// Sets up a result for a specific JS function call with specific arguments
    /// </summary>
    /// <param name="identifier">The JS function identifier</param>
    /// <param name="result">The result to return when this function is called</param>
    /// <param name="args">The arguments that should match for this setup</param>
    public void SetupResult(string identifier, object? result, params object?[]? args)
    {
        string key = CreateKey(identifier, args);
        _setupResults[key] = result;
    }

    /// <summary>
    /// Checks if a specific JS function was called with the given arguments
    /// </summary>
    /// <param name="identifier">The JS function identifier</param>
    /// <param name="args">The arguments that were passed</param>
    /// <returns>True if the function was called with these arguments, false otherwise</returns>
    public bool Called(string identifier, params object?[]? args)
    {
        return _calledMethods.Any(call => call.Identifier == identifier && ArgumentsMatch(call.Args, args));
    }

    /// <summary>
    /// Checks if a specific JS function was called (ignoring arguments)
    /// </summary>
    /// <param name="identifier">The JS function identifier</param>
    /// <returns>True if the function was called at least once, false otherwise</returns>
    public bool HasCall(string identifier)
    {
        return _calledMethods.Any(call => call.Identifier == identifier);
    }

    /// <summary>
    /// Checks if a specific JS function was called with the given arguments
    /// </summary>
    /// <param name="identifier">The JS function identifier</param>
    /// <param name="args">The arguments that were passed</param>
    /// <returns>True if the function was called with these arguments, false otherwise</returns>
    public bool HasCall(string identifier, params object?[]? args)
    {
        return Called(identifier, args);
    }

    /// <summary>
    /// Creates a unique key from identifier and arguments
    /// </summary>
    /// <param name="identifier">The JS function identifier</param>
    /// <param name="args">The arguments</param>
    /// <returns>A unique key representing the combination</returns>
    private static string CreateKey(string identifier, object?[]? args)
    {
        if (args == null || args.Length == 0)
        {
            return identifier;
        }

        string argsString = string.Join("-", args.Select(arg => arg?.ToString() ?? "null"));
        return $"{identifier}-{argsString}";
    }

    /// <summary>
    /// Gets all recorded method calls
    /// </summary>
    /// <returns>List of all method calls with their identifiers and arguments</returns>
    public IReadOnlyList<(string Identifier, object?[]? Args)> GetAllCalls()
    {
        return _calledMethods.AsReadOnly();
    }

    /// <summary>
    /// Clears all recorded method calls and setup results
    /// </summary>
    public void Clear()
    {
        _calledMethods.Clear();
        _setupResults.Clear();
    }

    public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args)
    {
        return InvokeAsync<TValue>(identifier, CancellationToken.None, args);
    }

    public ValueTask<TValue> InvokeAsync<TValue>(string identifier,
        CancellationToken cancellationToken,
        object?[]? args)
    {
        // Record the method call
        _calledMethods.Add((identifier, args));

        // Create key for lookup
        string key = CreateKey(identifier, args);

        // Return configured result if available
        if (_setupResults.TryGetValue(key, out object? result))
        {
            if (result is TValue typedResult)
            {
                return ValueTask.FromResult(typedResult);
            }

            if (result == null && !typeof(TValue).IsValueType)
            {
                return ValueTask.FromResult(default(TValue)!);
            }

            // Try to convert the result to the expected type
            try
            {
                return ValueTask.FromResult((TValue)Convert.ChangeType(result, typeof(TValue))!);
            }
            catch
            {
                // If conversion fails, return default value
                return ValueTask.FromResult(default(TValue)!);
            }
        }

        // Return default value if no result is configured
        return ValueTask.FromResult(default(TValue)!);
    }

    private static bool ArgumentsMatch(object?[]? args1, object?[]? args2)
    {
        if (args1 == null && args2 == null) return true;
        if (args1 == null || args2 == null) return false;
        if (args1.Length != args2.Length) return false;

        for (int i = 0; i < args1.Length; i++)
        {
            if (!Equals(args1[i], args2[i])) return false;
        }

        return true;
    }
}
