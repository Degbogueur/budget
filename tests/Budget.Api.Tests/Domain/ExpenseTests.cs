using Budget.Api.Domain;

namespace Budget.Api.Tests.Domain;

public class ExpenseTests
{
    private static readonly DateOnly Today = new(2026, 11, 15);
    private static readonly Category Groceries = Category.CreateCustom("user-1", "Groceries");

    [Fact]
    public void Create_with_valid_data_trims_description()
    {
        var expense = Expense.Create("user-1", "  Save-On-Foods  ", 86.40m, Groceries, Today, Today);

        Assert.Equal("Save-On-Foods", expense.Description);
        Assert.Equal(86.40m, expense.Amount);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(12.345)]
    public void Create_rejects_invalid_amount(decimal amount)
    {
        var ex = Assert.Throws<DomainException>(() =>
            Expense.Create("user-1", "Coffee", amount, Groceries, Today, Today));

        Assert.Equal("Amount", ex.Field);
    }

    [Fact]
    public void Create_rejects_a_future_date()
    {
        var ex = Assert.Throws<DomainException>(() =>
            Expense.Create("user-1", "Movie", 20m, Groceries, Today.AddDays(1), Today));

        Assert.Equal("Date", ex.Field);
    }

    [Fact]
    public void Create_rejects_another_users_category()
    {
        var someoneElses = Category.CreateCustom("user-2", "Gym");

        var ex = Assert.Throws<DomainException>(() =>
            Expense.Create("user-1", "Membership", 40m, someoneElses, Today, Today));

        Assert.Equal("CategoryId", ex.Field);
    }
}