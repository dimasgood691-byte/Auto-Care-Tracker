using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AutoCareTracker.API.Models;

namespace AutoCareTracker.API.Controllers
{
    public class WorkOrder
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string WoNumber { get; set; } = string.Empty; //contoh : WO-20261017-001

        [Required]
        public int VehicleId { get; set; }

        [ForeignKey("VehicleId")]
        public Vehicle? Vehicle { get; set; }

        [MaxLength(100)]
        public string? MechanicName { get; set; }

        [Required]
        public string Complaint { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = "Pending"; //Pending, InProgres, Complated, Cancelled

        public int OdometerInKm { get; set; }

        public DateTime? StartedAt { get; set; }
        public DateTime? FinishedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Relasi ke detail servis, sparepart, foto progres, dan invoice
        public ICollection<WorkOrderService>? Services { get; set; }
        public ICollection<WorkOrderItem>? Items { get; set; }
        public ICollection<ProgressPhoto>? ProgressPhotos { get; set; }
        public Invoice? Invoice { get; set; }

    }
}