using AutoCareTracker.API.Data;
using AutoCareTracker.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoCareTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Semua request wajib membawa token JWT yang valid (Staf maupun Customer Flutter)
    public class VehiclesController : ControllerBase
    {
        private readonly AppDBContext _context;

        public VehiclesController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/vehicles
        [HttpGet]
        [Authorize(Policy = "StaffOnly")] // Hanya staf bengkel yang boleh melihat seluruh data kendaraan
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehicles()
        {
            return await _context.Vehicles
                .Include(v => v.Owner)
                .ToListAsync();
        }

        // GET: api/vehicles/owner/5 (Untuk aplikasi Flutter mengambil mobil milik Customer tertentu)
        [HttpGet("owner/{ownerId}")]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehiclesByOwner(int ownerId)
        {
            return await _context.Vehicles
                .Where(v => v.OwnerId == ownerId)
                .ToListAsync();
        }

        // POST: api/vehicles
        [HttpPost]
        [Authorize(Policy = "KasirAccess")] // Hanya Kasir & SuperAdmin yang mendaftarkan kendaraan di bengkel
        public async Task<ActionResult<Vehicle>> PostVehicle(Vehicle vehicle)
        {
            vehicle.CreatedAt = DateTime.Now;
            vehicle.UpdatedAt = DateTime.Now;

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVehicles), new { id = vehicle.Id }, vehicle);
        }
    }
}