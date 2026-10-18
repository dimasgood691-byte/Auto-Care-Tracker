using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using AutoCareTracker.API.Controllers;

namespace AutoCareTracker.API.Models
{
    public class WorkOrderItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WorkOrderId { get; set; }

        [JsonIgnore]
        [ForeignKey("WorkOrderId")]
        public WorkOrder? WorkOrder { get; set; }

        [Required]
        public int SparepartId { get; set; }

        [ForeignKey("SparepartId")]
        public Sparepart? Sparepart { get; set; }

        public int Qty { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal UnitPrice { get; set; } // Harga saat transaksi terjadi

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}