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
    public class UsersController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly IConfiguration _config;

        public UsersController(AppDBContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpGet] //GET: api/users
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpPost()] //POST: api/users
        public async Task<ActionResult<User>> PostUser(User user)
        {
            // Validasi role default jika kosong
            if (string.IsNullOrEmpty(user.Role))
            {
                user.Role = "Customer";
            }

            user.CreatedAt = DateTime.Now;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
        }

        [HttpPost("login")] //POST: api/users/login
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Cari user di database yang email dan passwordnya sama persis
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email.ToLower() == request.Email.ToLower() &&
                u.PasswordHash == request.Password);

            // Jika tidak ada yang cocok
            if (user == null)
            {
                return Unauthorized(new { message = "Email atau password yang Anda masukkan salah." });
            }

            // Jika cocok, tapi role-nya bukan Admin
            if (user.Role != "Admin")
            {
                return StatusCode(403, new { message = "Akses ditolak! Portal web ini khusus untuk Admin bengkel." });
            }

            //generate token JWT berhasil login
            var tokenString = GenerateJwtToken(user);

            //kembalikan token ke frontend (response)
            return Ok(new
            {
                token = tokenString,
                user = new { user.Id, user.Fullname, email = user.Email, user.Role } //sembunyikan password dari response
            });
        }

        //function private untuk membuat token jwt
        private string GenerateJwtToken(User user)
        {
            var jwtKey = _config["Jwt:Key"]
                ?? throw new InvalidOperationException("Configuration value 'Jwt:Key' is required.");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            //data yang disisipkan ke dalam token (Payload)
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, user.Role), //sangat penting untuk fitur hak akses [Authorize(Roles="admin)]
                new Claim("UserId", user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3), //token akan hangus otomatis dalam 3 jam
                signingCredentials: credentials
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        // 3. CLASS UNTUK MENANGKAP INPUT DARI NEXT.JS
        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
    }
}