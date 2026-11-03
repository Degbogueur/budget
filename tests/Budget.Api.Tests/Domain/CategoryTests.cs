using Budget.Api.Domain;

namespace Budget.Api.Tests.Domain;

public class CategoryTests
{
    [Fact]
    public void CreateCustom_trims_the_name_and_marks_it_as_custom()
    {
        var category = Category.CreateCustom("user-1", "  Gym  ");

        Assert.Equal("Gym", category.Name);
        Assert.True(category.IsCustom);
    }

    [Theory]
    [InlineData("")]
    [InlineData("x")]
    [InlineData("A name that is far too long for a category")]
    public void CreateCustom_rejects_an_invalid_name(string name)
    {
        var ex = Assert.Throws<DomainException>(() => Category.CreateCustom("user-1", name));

        Assert.Equal("Name", ex.Field);
    }

    [Fact]
    public void A_custom_category_is_only_visible_to_its_owner()
    {
        var category = Category.CreateCustom("user-1", "Gym");

        Assert.True(category.IsVisibleTo("user-1"));
        Assert.False(category.IsVisibleTo("user-2"));
    }
}