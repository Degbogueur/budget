namespace Budget.Api.Domain;

public sealed class Category
{
    public const int NameMaxLength = 30;

    // Built-in categories, seeded in the database and shared by every user
    public static readonly IReadOnlyList<string> DefaultNames =
        ["Food", "Housing", "Transport", "Other"];

    public int Id { get; private set; }
    public string? UserId { get; private set; } // null = built-in category
    public string Name { get; private set; } = default!;

    public bool IsCustom => UserId is not null;

    private Category() { }

    public static Category CreateCustom(string userId, string? name) =>
        new() { UserId = userId, Name = ValidateName(name) };

    public bool IsVisibleTo(string userId) => UserId is null || UserId == userId;

    private static string ValidateName(string? name)
    {
        var value = name?.Trim() ?? "";
        if (value.Length < 2)
            throw new DomainException(nameof(Name), "Category name must be at least 2 characters long.");
        if (value.Length > NameMaxLength)
            throw new DomainException(nameof(Name), $"Category name must not exceed {NameMaxLength} characters.");
        return value;
    }
}