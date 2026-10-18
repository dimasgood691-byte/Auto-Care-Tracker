using AutoCareTracker.API.Data;
using AutoCareTracker.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoCareTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvoicesController : ControllerBase
    {
        private readonly AppDBContext _context;

        public InvoicesController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/invoices
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
        {
            return await _context.Invoices.OrderByDescending(i => i.IssuedAt).ToListAsync();
        }

        // POST: api/invoices/generate/5 (Otomatis hitung tagihan dari WorkOrderId)
        [HttpPost("generate/{workOrderId}")]
        public async Task<ActionResult<Invoice>> GenerateInvoice(int workOrderId)
        {
            var wo = await _context.WorkOrders
                .Include(w => w.Services)
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.Id == workOrderId);

            if (wo == null) return NotFound("Work Order tidak ditemukan.");

            var serviceTotal = wo.Services?.Sum(s => s.Price) ?? 0;
            var partsTotal = wo.Items?.Sum(i => i.Qty * i.UnitPrice) ?? 0;

            var invoice = new Invoice
            {
                WorkOrderId = workOrderId,
                ServiceTotal = serviceTotal,
                PartsTotal = partsTotal,
                GrandTotal = serviceTotal + partsTotal,
                PaymentStatus = "Unpaid",
                IssuedAt = DateTime.Now
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return Ok(invoice);
        }

        // PUT: api/invoices/5/pay (Kasir menandai tagihan Lunas)
        [HttpPut("{id}/pay")]
        public async Task<IActionResult> PayInvoice(int id, [FromBody] string paymentMethod)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return NotFound();

            invoice.PaymentStatus = "Paid";
            invoice.PaymentMethod = paymentMethod;
            invoice.PaidAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(invoice);
        }
    }
}