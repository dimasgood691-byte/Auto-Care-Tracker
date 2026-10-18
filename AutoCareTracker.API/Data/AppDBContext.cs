using Microsoft.EntityFrameworkCore;
using AutoCareTracker.API.Models;
using AutoCareTracker.API.Controllers;

namespace AutoCareTracker.API.Data
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions<AppDBContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Sparepart> Spareparts { get; set; }
        public DbSet<WorkOrder> WorkOrders { get; set; }
        public DbSet<WorkOrderService> WorkOrderServices { get; set; }
        public DbSet<WorkOrderItem> WorkOrderItems { get; set; }
        public DbSet<ProgressPhoto> ProgressPhotos { get; set; }
        public DbSet<Invoice> Invoices { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            //membuat nomor plat, sku, dan nomor Wo menjadi unik (uniquq index)
            modelBuilder.Entity<Vehicle>()
            .HasIndex(v => v.PlateNumber)
                .IsUnique();

            modelBuilder.Entity<Sparepart>()
                .HasIndex(s => s.Sku)
                .IsUnique();

            modelBuilder.Entity<WorkOrder>()
                .HasIndex(w => w.WoNumber)
                .IsUnique();
        }
    }
}