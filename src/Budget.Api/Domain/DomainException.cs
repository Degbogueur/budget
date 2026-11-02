namespace Budget.Api.Domain;

/// <summary>
/// Thrown when a business rule is violated.
/// </summary>
public sealed class DomainException(string field, string message) : Exception(message)
{
    public string Field { get; } = field;
}
