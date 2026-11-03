using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Budget.Api.Tests.Api;

/// <summary>
/// Starts the API in memory with a throwaway SQLite database for each run.
/// </summary>
public sealed class BudgetApiFactory : WebApplicationFactory<Program>
{
    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"budget-tests-{Guid.NewGuid()}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Budget", $"Data Source={_dbPath}");
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools(); // release the file before deleting it
        File.Delete(_dbPath);
    }
}