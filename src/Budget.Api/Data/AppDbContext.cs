using Budget.Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Budget.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<IdentityUser>(options)
{
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder); // required: configures the Identity tables

        builder.Entity<Category>(c =>
        {
            c.Property(x => x.Name).HasMaxLength(Category.NameMaxLength).IsRequired();
            c.HasIndex(x => new { x.UserId, x.Name }).IsUnique();
            c.HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);

            // Built-in categories (UserId = null), inserted by the migration
            c.HasData(Category.DefaultNames.Select((name, i) =>
                new { Id = i + 1, Name = name, UserId = (string?)null }));
        });

        builder.Entity<Expense>(e =>
        {
            e.Property(x => x.Description).HasMaxLength(Expense.DescriptionMaxLength).IsRequired();
            e.Property(x => x.UserId).IsRequired();
            e.HasIndex(x => new { x.UserId, x.Date });
            e.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}