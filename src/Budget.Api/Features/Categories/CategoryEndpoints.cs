using System.Security.Claims;
using Budget.Api.Data;
using Budget.Api.Domain;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Budget.Api.Features.Categories;

public record CategoryResponse(int Id, string Name, bool IsCustom);

public record CreateCategoryRequest(string? Name);

public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/categories")
            .WithTags("Categories")
            .RequireAuthorization();

        group.MapGet("/", GetCategories);
        group.MapPost("/", CreateCategory);
    }

    // Built-in categories first, then the user's own, alphabetically
    private static async Task<Ok<List<CategoryResponse>>> GetCategories(ClaimsPrincipal user, AppDbContext db)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await db.Categories.AsNoTracking()
            .Where(c => c.UserId == null || c.UserId == userId)
            .OrderBy(c => c.UserId != null).ThenBy(c => c.Name)
            .Select(c => new CategoryResponse(c.Id, c.Name, c.UserId != null))
            .ToListAsync();

        return TypedResults.Ok(items);
    }

    private static async Task<Created<CategoryResponse>> CreateCategory(
        CreateCategoryRequest request, ClaimsPrincipal user, AppDbContext db)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var category = Category.CreateCustom(userId, request.Name);

        // Uniqueness needs the database, so it is checked here rather than in the entity
        var name = category.Name.ToLower();
        var exists = await db.Categories.AnyAsync(c =>
            (c.UserId == null || c.UserId == userId) && c.Name.ToLower() == name);
        if (exists)
            throw new DomainException(nameof(Category.Name), "A category with this name already exists.");

        db.Categories.Add(category);
        await db.SaveChangesAsync();

        return TypedResults.Created($"/api/categories/{category.Id}",
            new CategoryResponse(category.Id, category.Name, IsCustom: true));
    }
}