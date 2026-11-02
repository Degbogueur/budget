using System.Globalization;
using Budget.Api.Data;
using Budget.Api.Domain;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Budget.Api.Features.Expenses;

public static class ExpenseEndpoints
{
    // Temporary: replaced by the signed-in user in the Identity step
    private const string DemoUserId = "demo";

    public static void MapExpenseEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/expenses")
            .WithTags("Expenses");

        group.MapGet("/", GetExpenses);
        group.MapGet("/summary", GetSummary);
        group.MapGet("/{id:int}", GetExpense);
        group.MapPost("/", CreateExpense);
        group.MapPut("/{id:int}", UpdateExpense);
        group.MapDelete("/{id:int}", DeleteExpense);
    }

    // GET /api/expenses?month=2026-11&categoryId=4
    private static async Task<Ok<List<ExpenseResponse>>> GetExpenses(
        string? month, int? categoryId, AppDbContext db, TimeProvider clock)
    {
        var userId = DemoUserId;
        var (from, to) = MonthRange(month, clock);
        var query = db.Expenses.AsNoTracking()
            .Where(e => e.UserId == userId && e.Date >= from && e.Date < to);

        if (categoryId is not null)
            query = query.Where(e => e.CategoryId == categoryId);

        var items = await query
            .OrderByDescending(e => e.Date).ThenByDescending(e => e.Id)
            .Select(e => new ExpenseResponse(e.Id, e.Description, e.Amount, e.CategoryId, e.Category.Name, e.Date))
            .ToListAsync();

        return TypedResults.Ok(items);
    }

    // GET /api/expenses/summary?month=2026-11
    private static async Task<Ok<MonthSummaryResponse>> GetSummary(
        string? month, AppDbContext db, TimeProvider clock)
    {
        var userId = DemoUserId;
        var (from, to) = MonthRange(month, clock);

        // SQLite cannot sum decimals in SQL: load the month's amounts
        // (a few dozen rows) and aggregate in memory with LINQ.
        var rows = await db.Expenses.AsNoTracking()
            .Where(e => e.UserId == userId && e.Date >= from && e.Date < to)
            .Select(e => new { Category = e.Category.Name, e.Amount })
            .ToListAsync();

        var byCategory = rows
            .GroupBy(r => r.Category)
            .Select(g => new CategoryTotal(g.Key, g.Sum(r => r.Amount)))
            .OrderByDescending(c => c.Total)
            .ToList();

        return TypedResults.Ok(new MonthSummaryResponse(
            from.ToString("yyyy-MM", CultureInfo.InvariantCulture), rows.Sum(r => r.Amount), rows.Count, byCategory));
    }

    private static async Task<Results<Ok<ExpenseResponse>, NotFound>> GetExpense(
        int id, AppDbContext db)
    {
        var userId = DemoUserId;
        var expense = await db.Expenses.AsNoTracking()
            .Where(e => e.Id == id && e.UserId == userId)
            .Select(e => new ExpenseResponse(e.Id, e.Description, e.Amount, e.CategoryId, e.Category.Name, e.Date))
            .FirstOrDefaultAsync();

        return expense is null ? TypedResults.NotFound() : TypedResults.Ok(expense);
    }

    private static async Task<Created<ExpenseResponse>> CreateExpense(
        SaveExpenseRequest request, AppDbContext db, TimeProvider clock)
    {
        var userId = DemoUserId;
        var today = Today(clock);
        var category = await FindCategory(db, request.CategoryId, userId);
        var expense = Expense.Create(userId, request.Description, request.Amount, category, request.Date ?? today, today);

        db.Expenses.Add(expense);
        await db.SaveChangesAsync();

        return TypedResults.Created($"/api/expenses/{expense.Id}",
            new ExpenseResponse(expense.Id, expense.Description, expense.Amount, category.Id, category.Name, expense.Date));
    }

    private static async Task<Results<NoContent, NotFound>> UpdateExpense(
        int id, SaveExpenseRequest request, AppDbContext db, TimeProvider clock)
    {
        var userId = DemoUserId;
        var expense = await db.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        if (expense is null) return TypedResults.NotFound();

        var category = await FindCategory(db, request.CategoryId, userId);
        expense.Update(request.Description, request.Amount, category, request.Date ?? expense.Date, Today(clock));
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }

    private static async Task<Results<NoContent, NotFound>> DeleteExpense(
        int id, AppDbContext db)
    {
        var userId = DemoUserId;
        var deleted = await db.Expenses
            .Where(e => e.Id == id && e.UserId == userId)
            .ExecuteDeleteAsync();

        return deleted == 0 ? TypedResults.NotFound() : TypedResults.NoContent();
    }

    // Built-in categories and the user's own; anything else is "unknown"
    private static async Task<Category> FindCategory(AppDbContext db, int categoryId, string userId) =>
        await db.Categories.FirstOrDefaultAsync(c => c.Id == categoryId && (c.UserId == null || c.UserId == userId))
        ?? throw new DomainException(nameof(Expense.CategoryId), "Unknown category.");

    private static DateOnly Today(TimeProvider clock) =>
        DateOnly.FromDateTime(clock.GetLocalNow().DateTime);

    // "2026-11" -> [2026-11-01, 2026-12-01[ ; current month when missing or invalid
    private static (DateOnly From, DateOnly To) MonthRange(string? month, TimeProvider clock)
    {
        var today = Today(clock);
        var from = DateOnly.TryParseExact(month + "-01", "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed)
            ? parsed
            : new DateOnly(today.Year, today.Month, 1);
        return (from, from.AddMonths(1));
    }
}