using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace Budget.Api.Features.Auth;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        // /register, /login, /refresh, /manage/info… provided by ASP.NET Core Identity
        group.MapIdentityApi<IdentityUser>();

        // MapIdentityApi has no logout endpoint: add one
        group.MapPost("/logout", async (SignInManager<IdentityUser> signInManager) =>
        {
            await signInManager.SignOutAsync();
            return TypedResults.NoContent();
        }).RequireAuthorization();

        group.MapGet("/me", (ClaimsPrincipal user) =>
            TypedResults.Ok(new { email = user.Identity!.Name }))
            .RequireAuthorization();
    }
}