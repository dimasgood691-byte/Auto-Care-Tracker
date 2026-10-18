using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using AutoCareTracker.API.Controllers;

namespace AutoCareTracker.API.Models
{
    public class Invoice
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WorkOrderId { get; set; }

        [JsonIgnore]
        [ForeignKey("WorkOrderId")]
        public WorkOrder? WorkOrder { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal ServiceTotal { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal PartsTotal { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal GrandTotal { get; set; }

        [Required]
        [MaxLength(20)]
        public string PaymentStatus { get; set; } = "Unpaid"; // Unpaid, Paid, Voided

        [MaxLength(30)]
        public string? PaymentMethod { get; set; } // Cash, QRIS, Transfer

        public DateTime IssuedAt { get; set; } = DateTime.Now;
        public DateTime? PaidAt { get; set; }
        public DateTime? VoidedAt { get; set; }
    }
}