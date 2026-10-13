using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoCareTracker.API.Data;
using AutoCareTracker.API.Models;

namespace AutoCareTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDBContext _context;

        public UsersController(AppDBContext context)
        {
            _context = context;
        }

        [HttpGet] //GET: api/users
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpPost] //POST: api/users
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
    }
}