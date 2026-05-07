using FinCalc.Models;
using Microsoft.EntityFrameworkCore;

namespace FinCalc.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        public DbSet<User> Users { get; set; }



    }
}
