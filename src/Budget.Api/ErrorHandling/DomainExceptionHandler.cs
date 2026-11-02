using Budget.Api.Domain;
using Microsoft.AspNetCore.Diagnostics;

namespace Budget.Api.ErrorHandling;

/// <summary>
/// Turns a DomainException into a 400 response with the same shape as
/// ASP.NET Core validation errors: { title, status, errors: { "Amount": ["…"] } }.
/// </summary>
public sealed class DomainExceptionHandler(IProblemDetailsService problemDetails) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not DomainException domain) return false; // let other handlers deal with other exceptions

        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new HttpValidationProblemDetails(
                new Dictionary<string, string[]> { [domain.Field] = [domain.Message] })
            {
                Title = "A business rule was violated.",
                Status = StatusCodes.Status400BadRequest
            }
        });
    }
}