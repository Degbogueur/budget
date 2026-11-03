using System.Net;
using System.Net.Http.Json;

namespace Budget.Api.Tests.Api;

public class ExpensesApiTests(BudgetApiFactory factory) : IClassFixture<BudgetApiFactory>
{
    private const int Food = 1;
    private record ExpenseDto(int Id, string Description, decimal Amount, int CategoryId, string Category, DateOnly Date);
    private record CategoryDto(int Id, string Name, bool IsCustom);

    [Fact]
    public async Task Expenses_require_authentication()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/expenses");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task A_logged_in_user_can_create_and_list_expenses()
    {
        var client = factory.CreateClient(); // keeps cookies between requests
        await RegisterAndLogin(client, "alice@test.ca");

        var create = await client.PostAsJsonAsync("/api/expenses",
            new { description = "Groceries", amount = 86.40m, categoryId = Food });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);

        var list = await client.GetFromJsonAsync<List<ExpenseDto>>("/api/expenses");
        var expense = Assert.Single(list!);
        Assert.Equal("Groceries", expense.Description);
        Assert.Equal("Food", expense.Category);
    }

    [Fact]
    public async Task Invalid_expense_returns_a_validation_problem()
    {
        var client = factory.CreateClient();
        await RegisterAndLogin(client, "bob@test.ca");

        var response = await client.PostAsJsonAsync("/api/expenses",
            new { description = "Coffee", amount = -3m, categoryId = Food });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"Amount\"", body);
    }

    [Fact]
    public async Task A_user_can_create_a_custom_category_and_use_it()
    {
        var client = factory.CreateClient();
        await RegisterAndLogin(client, "carol@test.ca");

        var created = await client.PostAsJsonAsync("/api/categories", new { name = "Gym" });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var gym = (await created.Content.ReadFromJsonAsync<CategoryDto>())!;
        Assert.True(gym.IsCustom);

        var duplicate = await client.PostAsJsonAsync("/api/categories", new { name = "gym" });
        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);

        var expense = await client.PostAsJsonAsync("/api/expenses",
            new { description = "Monthly membership", amount = 45m, categoryId = gym.Id });
        Assert.Equal(HttpStatusCode.Created, expense.StatusCode);

        var categories = await client.GetFromJsonAsync<List<CategoryDto>>("/api/categories");
        Assert.Equal(5, categories!.Count); // 4 built-in + Gym
    }

    [Fact]
    public async Task Custom_categories_are_private()
    {
        var owner = factory.CreateClient();
        await RegisterAndLogin(owner, "dave@test.ca");
        var created = await owner.PostAsJsonAsync("/api/categories", new { name = "Fishing" });
        var fishing = (await created.Content.ReadFromJsonAsync<CategoryDto>())!;

        var other = factory.CreateClient();
        await RegisterAndLogin(other, "erin@test.ca");
        var response = await other.PostAsJsonAsync("/api/expenses",
            new { description = "Bait", amount = 12m, categoryId = fishing.Id });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("\"CategoryId\"", await response.Content.ReadAsStringAsync());
    }

    private static async Task RegisterAndLogin(HttpClient client, string email)
    {
        const string password = "Passw0rd!";
        (await client.PostAsJsonAsync("/api/auth/register", new { email, password })).EnsureSuccessStatusCode();
        (await client.PostAsJsonAsync("/api/auth/login?useCookies=true", new { email, password })).EnsureSuccessStatusCode();
    }
}