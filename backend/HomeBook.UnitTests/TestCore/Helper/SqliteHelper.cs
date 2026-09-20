using System.Text;
using Microsoft.Data.Sqlite;

namespace HomeBook.UnitTests.TestCore.Helper;

public static class SqliteHelper
{
    public static string GetAllTableNames(SqliteConnection connection)
    {
        var sb = new StringBuilder();

        using var cmd = connection.CreateCommand();
        cmd.CommandText = @"
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
            ORDER BY name;";

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            sb.AppendLine(reader.GetString(0));
        }

        return sb.ToString();
    }

    public static List<string[]> DumpTable(SqliteConnection connection, string tableName)
    {
        var rows = new List<string[]>();

        using var cmd = connection.CreateCommand();
        cmd.CommandText = $"SELECT * FROM {tableName};";

        using var reader = cmd.ExecuteReader();
        var fieldCount = reader.FieldCount;

        // Header hinzufügen
        var header = new string[fieldCount];
        for (int i = 0; i < fieldCount; i++)
            header[i] = reader.GetName(i);
        rows.Add(header);

        // Daten hinzufügen
        while (reader.Read())
        {
            var values = new string[fieldCount];
            for (int i = 0; i < fieldCount; i++)
                values[i] = reader.IsDBNull(i) ? "NULL" : reader.GetValue(i)!.ToString()!;
            rows.Add(values);
        }

        return rows;
    }


    public static string GetContentByTableName(SqliteConnection connection, string tableName)
    {
        using var cmd = connection.CreateCommand();
        cmd.CommandText = $"SELECT * FROM {tableName};";

        using var reader = cmd.ExecuteReader();

        if (!reader.HasRows)
            return $"-- No rows in table {tableName}";

        var sb = new StringBuilder();

        // Spaltennamen
        for (int i = 0; i < reader.FieldCount; i++)
        {
            sb.Append(reader.GetName(i));
            if (i < reader.FieldCount - 1)
                sb.Append(" | ");
        }

        sb.AppendLine();
        sb.AppendLine(new string('-', 50));

        // Inhalte
        while (reader.Read())
        {
            for (int i = 0; i < reader.FieldCount; i++)
            {
                sb.Append(reader.IsDBNull(i) ? "NULL" : reader.GetValue(i));
                if (i < reader.FieldCount - 1)
                    sb.Append(" | ");
            }

            sb.AppendLine();
        }

        return sb.ToString();
    }
}
