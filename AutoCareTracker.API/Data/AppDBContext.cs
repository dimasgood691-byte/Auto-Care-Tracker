using Microsoft.EntityFrameworkCore;
using AutoCareTracker.API.Models;

namespace AutoCareTracker.API.Data
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions<AppDBContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        // Nanti kita bisa tambahkan DbSet lain di sini (Vehicles, ServiceOrders, dll)
    }
}