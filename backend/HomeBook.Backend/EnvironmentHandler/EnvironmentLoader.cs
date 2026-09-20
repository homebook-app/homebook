namespace HomeBook.Backend.EnvironmentHandler;

public static class EnvironmentLoader
{
    public static void LoadEnvFile(string envFile)
    {
        if (!File.Exists(envFile))
            return;

        foreach (string line in File.ReadAllLines(envFile))
        {
            string trimmed = line.Trim();

            if (string.IsNullOrWhiteSpace(trimmed)
                || trimmed.StartsWith('#'))
                continue;

            int idx = trimmed.IndexOf('=');
            if (idx <= 0)
                continue;

            string key = trimmed.Substring(0, idx).Trim();
            string value = trimmed[(idx + 1)..].Trim();
            if (!string.IsNullOrEmpty(key))
                Environment.SetEnvironmentVariable(key, value);
        }
    }
}
