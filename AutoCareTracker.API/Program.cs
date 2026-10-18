using Microsoft.EntityFrameworkCore;
using AutoCareTracker.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//kode ini untuk menghubungkan ke database sql server
builder.Services.AddDbContext<AppDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//konfigurasi CORS untuk mengizinkan permintaan dari Flutter dan Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFlutterAndNextjs", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin))
                {
                    return true;
                }

                return origin.StartsWith("http://localhost", StringComparison.OrdinalIgnoreCase)
                    || origin.StartsWith("http://127.0.0.1", StringComparison.OrdinalIgnoreCase)
                    || origin.StartsWith("http://10.0.2.2", StringComparison.OrdinalIgnoreCase)
                    || origin.StartsWith("http://192.168.", StringComparison.OrdinalIgnoreCase)
                    || origin.StartsWith("https://localhost", StringComparison.OrdinalIgnoreCase)
                    || origin.StartsWith("https://127.0.0.1", StringComparison.OrdinalIgnoreCase)
                    || origin.StartsWith("https://10.0.2.2", StringComparison.OrdinalIgnoreCase)
                    || origin.StartsWith("https://192.168.", StringComparison.OrdinalIgnoreCase)
                    || origin.StartsWith("http://[::1]", StringComparison.OrdinalIgnoreCase)
                    || origin.StartsWith("https://[::1]", StringComparison.OrdinalIgnoreCase);
            })
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFlutterAndNextjs");
app.UseAuthorization();
app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
