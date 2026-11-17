using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoCareTracker.API.Data;
using AutoCareTracker.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AutoCareTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "StaffOnly")] // Staf (SuperAdmin, Kasir, Mekanik) dapat melihat daftar user/pelanggan
    public class UsersController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly IConfiguration _config;
        private readonly PasswordHasher<User> _passwordHasher = new();

        private static readonly string[] ValidRoles = { "Customer", "SuperAdmin", "Kasir", "Mekanik" };

        public UsersController(AppDBContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpGet] // GET: api/users
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            // PasswordHash otomatis disembunyikan berkat [JsonIgnore] di User.cs
            return await _context.Users.ToListAsync();
        }

        // Hanya SuperAdmin ber-token yang bisa membuat akun staf/user baru
        [HttpPost] // POST: api/users
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<ActionResult<User>> PostUser([FromBody] CreateUserRequest request)
        {
            var normalizedEmail = request.Email.Trim().ToLower();
            if (string.IsNullOrWhiteSpace(normalizedEmail) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email dan password wajib diisi." });
            }

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
            {
                return BadRequest(new { message = "Email sudah terdaftar. Gunakan alamat email lain." });
            }

            var role = (!string.IsNullOrEmpty(request.Role) && ValidRoles.Contains(request.Role))
                ? request.Role
                : "Customer";

            var user = new User
            {
                Fullname = request.Fullname.Trim(),
                Email = request.Email.Trim(),
                PhoneNumber = request.PhoneNumber?.Trim() ?? string.Empty,
                Role = role,
                CreatedAt = DateTime.Now
            };

            // Hash password sebelum disimpan ke database
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
        }

        // Endpoint registrasi publik untuk Customer (aplikasi Flutter)
        [AllowAnonymous]
        [HttpPost("register")] // POST: api/users/register
        public async Task<ActionResult<User>> RegisterCustomer([FromBody] CreateUserRequest request)
        {
            var normalizedEmail = request.Email.Trim().ToLower();
            if (string.IsNullOrWhiteSpace(normalizedEmail) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email dan password wajib diisi." });
            }

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
            {
                return BadRequest(new { message = "Email sudah terdaftar. Silakan langsung login." });
            }

            var user = new User
            {
                Fullname = request.Fullname.Trim(),
                Email = request.Email.Trim(),
                PhoneNumber = request.PhoneNumber?.Trim() ?? string.Empty,
                Role = "Customer", // Paksa menjadi Customer
                CreatedAt = DateTime.Now
            };

            // Hash password sebelum disimpan ke database
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
        }

        // Endpoint Login untuk Web (Staf) dan Mobile Flutter (Customer)
        [AllowAnonymous]
        [HttpPost("login")] // POST: api/users/login
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email.ToLower() == request.Email.ToLower());

            if (user == null)
            {
                return Unauthorized(new { message = "Email atau password yang Anda masukkan salah." });
            }

            bool isPasswordValid = false;

            try
            {
                // Verifikasi menggunakan PasswordHasher
                var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
                if (result == PasswordVerificationResult.Success ||
                    result == PasswordVerificationResult.SuccessRehashNeeded)
                {
                    isPasswordValid = true;
                }
            }
            catch (FormatException)
            {
                // Fallback untuk akun lama di database yang password-nya masih plain-text (belum di-hash)
                if (user.PasswordHash == request.Password)
                {
                    isPasswordValid = true;
                    // Otomatis upgrade password plain-text di database menjadi hash
                    user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
                    await _context.SaveChangesAsync();
                }
            }

            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Email atau password yang Anda masukkan salah." });
            }

            var tokenString = GenerateJwtToken(user);

            return Ok(new
            {
                token = tokenString,
                user = new { user.Id, user.Fullname, email = user.Email, user.Role }
            });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _config["Jwt:Key"]
                ?? throw new InvalidOperationException("Configuration value 'Jwt:Key' is required.");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("role", user.Role), // Claim tambahan agar mudah dibaca di frontend/middleware
                new Claim("UserId", user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: credentials
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class CreateUserRequest
        {
            public string Fullname { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string? PhoneNumber { get; set; }
            public string? Role { get; set; }
        }
    }
}