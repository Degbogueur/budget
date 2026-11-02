namespace Budget.Api.Domain;

public sealed class Expense
{
    public const int DescriptionMaxLength = 100;
    public const decimal MaxAmount = 100_000m;

    public int Id { get; private set; }
    public string UserId { get; private set; } = default!;
    public string Description { get; private set; } = default!;
    public decimal Amount { get; private set; }
    public int CategoryId { get; private set; }
    public Category Category { get; private set; } = default!;
    public DateOnly Date { get; private set; }

    private Expense() { }

    public static Expense Create(string userId, string? description, decimal amount,
        Category category, DateOnly date, DateOnly today)
    {
        var expense = new Expense { UserId = userId };
        expense.Update(description, amount, category, date, today);
        return expense;
    }

    public void Update(string? description, decimal amount, Category category, DateOnly date, DateOnly today)
    {
        Description = ValidateDescription(description);
        Amount = ValidateAmount(amount);
        Date = ValidateDate(date, today);
        Category = ValidateCategory(category, UserId);
        CategoryId = category.Id;
    }

    private static string ValidateDescription(string? description)
    {
        var value = description?.Trim() ?? "";
        if (value.Length < 2)
            throw new DomainException(nameof(Description), "Description must be at least 2 characters long.");
        if (value.Length > DescriptionMaxLength)
            throw new DomainException(nameof(Description), $"Description must not exceed {DescriptionMaxLength} characters.");
        return value;
    }

    private static decimal ValidateAmount(decimal amount)
    {
        if (amount <= 0)
            throw new DomainException(nameof(Amount), "Amount must be greater than 0.");
        if (amount > MaxAmount)
            throw new DomainException(nameof(Amount), "Amount must not exceed 100,000.");
        if (decimal.Round(amount, 2) != amount)
            throw new DomainException(nameof(Amount), "Amount cannot have more than 2 decimal places.");
        return amount;
    }

    private static DateOnly ValidateDate(DateOnly date, DateOnly today)
    {
        if (date > today)
            throw new DomainException(nameof(Date), "Date cannot be in the future.");
        return date;
    }

    // A user can only file an expense under a built-in category or one of their own
    private static Category ValidateCategory(Category category, string userId)
    {
        if (!category.IsVisibleTo(userId))
            throw new DomainException(nameof(CategoryId), "Unknown category.");
        return category;
    }
}