using System .ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoCareTracker.API.Controllers
{
    public class Sparepart
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(30)]
        public string Sku { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Unit { get; set; } = "Pcs";

        public int StocQty {get; set; }

        public int MinStock { get; set; } = 5;

        [Column(TypeName = "decimal(12,2)")]
        public decimal UnitPrice { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}