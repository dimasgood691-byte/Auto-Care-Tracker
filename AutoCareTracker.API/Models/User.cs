using System.ComponentModel.DataAnnotations;

namespace AutoCareTracker.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Fullname { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Customer"; // Default role is "Customer"
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}