using AutoCareTracker.API.Data;
using AutoCareTracker.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace AutoCareTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "StaffOnly")] // Semua staf bisa melihat daftar & stok sparepart (GET)
    public class SparepartsController : ControllerBase
    {
        private readonly AppDBContext _context;

        public SparepartsController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/spareparts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sparepart>>> GetSpareparts()
        {
            return await _context.Spareparts.ToListAsync();
        }

        // POST: api/spareparts
        [HttpPost]
        [Authorize(Policy = "MekanikAccess")] // Hanya Mekanik & SuperAdmin yang bisa menambah master sparepart baru
        public async Task<ActionResult<Sparepart>> PostSparepart(Sparepart sparepart)
        {
            sparepart.CreatedAt = DateTime.Now;
            sparepart.UpdatedAt = DateTime.Now;

            _context.Spareparts.Add(sparepart);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSpareparts), new { id = sparepart.Id }, sparepart);
        }

        // PUT: api/spareparts/5
        [HttpPut("{id}")]
        [Authorize(Policy = "MekanikAccess")] // Hanya Mekanik & SuperAdmin yang bisa mengupdate stok/harga sparepart
        public async Task<IActionResult> PutSparepart(int id, Sparepart sparepart)
        {
            if (id != sparepart.Id) return BadRequest();

            sparepart.UpdatedAt = DateTime.Now;
            _context.Entry(sparepart).State = EntityState.Modified;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}