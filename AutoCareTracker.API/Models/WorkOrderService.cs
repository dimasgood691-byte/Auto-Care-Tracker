using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using AutoCareTracker.API.Controllers;

namespace AutoCareTracker.API.Models
{
    public class WorkOrderService
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WorkOrderId { get; set; }

        [JsonIgnore]
        [ForeignKey("WorkOrderId")]
        public WorkOrder? WorkOrder { get; set; }

        [Required]
        [MaxLength(255)]
        public string Description { get; set; } = string.Empty; // Contoh: "Jasa Ganti Oli & Tune Up"

        [Column(TypeName = "decimal(12,2)")]
        public decimal Price { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}