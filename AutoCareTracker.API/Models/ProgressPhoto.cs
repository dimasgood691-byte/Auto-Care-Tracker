using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using AutoCareTracker.API.Controllers;

namespace AutoCareTracker.API.Models
{
    public class ProgressPhoto
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
        public string FileKey { get; set; } = string.Empty; // URL atau path gambar

        [MaxLength(255)]
        public string? Caption { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}