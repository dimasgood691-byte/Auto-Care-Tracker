using AutoCareTracker.API.Data;
using AutoCareTracker.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoCareTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkOrdersController : ControllerBase
    {
        private readonly AppDBContext _context;

        public WorkOrdersController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/workorders (Lengkap dengan detail mobil, pemilik, jasa, sparepart, foto, dan invoice)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkOrder>>> GetWorkOrders()
        {
            return await _context.WorkOrders
                .Include(w => w.Vehicle)
                    .ThenInclude(v => v!.Owner)
                .Include(w => w.Services)
                .Include(w => w.Items)!
                    .ThenInclude(i => i.Sparepart)
                .Include(w => w.ProgressPhotos)
                .Include(w => w.Invoice)
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync();
        }

        // GET: api/workorders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkOrder>> GetWorkOrder(int id)
        {
            var workOrder = await _context.WorkOrders
                .Include(w => w.Vehicle)
                    .ThenInclude(v => v!.Owner)
                .Include(w => w.Services)
                .Include(w => w.Items)!
                    .ThenInclude(i => i.Sparepart)
                .Include(w => w.ProgressPhotos)
                .Include(w => w.Invoice)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (workOrder == null) return NotFound();

            return workOrder;
        }

        // POST: api/workorders (Membuat Work Order Baru)
        [HttpPost]
        public async Task<ActionResult<WorkOrder>> PostWorkOrder(WorkOrder workOrder)
        {
            // Generate nomor WO otomatis jika kosong
            if (string.IsNullOrEmpty(workOrder.WoNumber))
            {
                workOrder.WoNumber = $"WO-{DateTime.Now:yyyyMMdd}-{Random.Shared.Next(100, 999)}";
            }

            workOrder.CreatedAt = DateTime.Now;
            workOrder.UpdatedAt = DateTime.Now;

            // Update odometer kendaraan saat masuk bengkel
            var vehicle = await _context.Vehicles.FindAsync(workOrder.VehicleId);
            if (vehicle != null && workOrder.OdometerInKm > vehicle.CurrentOdometerKm)
            {
                vehicle.CurrentOdometerKm = workOrder.OdometerInKm;
                vehicle.UpdatedAt = DateTime.Now;
            }

            _context.WorkOrders.Add(workOrder);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWorkOrder), new { id = workOrder.Id }, workOrder);
        }

        // PUT: api/workorders/5/status (Update Status & Nama Mekanik)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] WorkOrder updateData)
        {
            var wo = await _context.WorkOrders.FindAsync(id);
            if (wo == null) return NotFound();

            wo.Status = updateData.Status;
            wo.MechanicName = updateData.MechanicName ?? wo.MechanicName;
            wo.UpdatedAt = DateTime.Now;

            if (updateData.Status == "InProgress" && wo.StartedAt == null)
                wo.StartedAt = DateTime.Now;
            else if (updateData.Status == "Completed")
                wo.FinishedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(wo);
        }

        // POST: api/workorders/5/services (Tambah Biaya Jasa ke WO)
        [HttpPost("{id}/services")]
        public async Task<ActionResult<WorkOrderService>> AddService(int id, WorkOrderService service)
        {
            service.WorkOrderId = id;
            service.CreatedAt = DateTime.Now;

            _context.WorkOrderServices.Add(service);
            await _context.SaveChangesAsync();

            return Ok(service);
        }

        // POST: api/workorders/5/items (Tambah Sparepart ke WO & Potong Stok Otomatis)
        [HttpPost("{id}/items")]
        public async Task<ActionResult<WorkOrderItem>> AddSparepartItem(int id, WorkOrderItem item)
        {
            var sparepart = await _context.Spareparts.FindAsync(item.SparepartId);
            if (sparepart == null) return NotFound("Sparepart tidak ditemukan.");
            if (sparepart.StocQty < item.Qty) return BadRequest("Stok sparepart tidak mencukupi.");

            // Potong stok sparepart otomatis
            sparepart.StocQty -= item.Qty;
            sparepart.UpdatedAt = DateTime.Now;

            item.WorkOrderId = id;
            item.UnitPrice = sparepart.UnitPrice; // Kunci harga saat ini
            item.CreatedAt = DateTime.Now;

            _context.WorkOrderItems.Add(item);
            await _context.SaveChangesAsync();

            return Ok(item);
        }

        // POST: api/workorders/5/photos (Tambah Foto Progres Pengerjaan)
        [HttpPost("{id}/photos")]
        public async Task<ActionResult<ProgressPhoto>> AddPhoto(int id, ProgressPhoto photo)
        {
            photo.WorkOrderId = id;
            photo.CreatedAt = DateTime.Now;

            _context.ProgressPhotos.Add(photo);
            await _context.SaveChangesAsync();

            return Ok(photo);
        }
    }
}