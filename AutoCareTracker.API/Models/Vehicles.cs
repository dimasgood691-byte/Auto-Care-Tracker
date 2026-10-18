using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using AutoCareTracker.API.Controllers;

namespace AutoCareTracker.API.Models
{
    public class Vehicle
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OwnerId { get; set; }

        [ForeignKey("OwnerId")]
        public User? Owner { get; set; }

        [Required]
        [MaxLength(15)]
        public string PlateNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Brand { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Model { get; set; } = string.Empty;

        public short Year { get; set; }

        public int CurrentOdometerKm { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        [JsonIgnore]
        public ICollection<WorkOrder>? WorkOrders { get; set; }
    }
}

