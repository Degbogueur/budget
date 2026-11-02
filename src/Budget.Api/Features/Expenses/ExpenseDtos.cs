namespace Budget.Api.Features.Expenses;

public record ExpenseResponse(int Id, string Description, decimal Amount, int CategoryId, string Category, DateOnly Date);

// Date is optional: defaults to today
public record SaveExpenseRequest(string? Description, decimal Amount, int CategoryId, DateOnly? Date);

public record CategoryTotal(string Category, decimal Total);

public record MonthSummaryResponse(string Month, decimal Total, int Count, IReadOnlyList<CategoryTotal> ByCategory);