using AutoCareTracker.API.Data;
using AutoCareTracker.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoCareTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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