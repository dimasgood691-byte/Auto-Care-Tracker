using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AutoCareTracker.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(100)]
        public string Fullname { get; set; } = string.Empty; //Nullable fullname karna admin tidak wajib mengisi fullname, tapi customer wajib mengisi fullname

        [Required]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Role { get; set; } = "Customer"; // Default role is "Customer"

        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty; //Nullable phone number karna admin tidak wajib mengisi phone number, tapi customer wajib mengisi phone number

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdateAt { get; set; } = DateTime.Now;

        [JsonIgnore] //relasi : 1 customer bisa punya banyak kendaraan.
        public ICollection<Vehicle>? Vehicles {get; set;}
    }
}