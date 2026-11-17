using Microsoft.EntityFrameworkCore;
using AutoCareTracker.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Auto Care Tracker API",
        Version = "v1",
        Description = "REST API Sistem Manajemen Bengkel Kendaraan Terintegrasi (TeFA Wisesa)"
    });

    // Konfigurasi tombol Authorize (JWT Bearer) di Swagger UI
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Masukkan token JWT hasil login di sini (tanpa kata 'Bearer')."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});

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

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Configuration value 'Jwt:Key' is required.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// Konfigurasi Role Hierarchy (Kasir & Mekanik extends dari SuperAdmin)
builder.Services.AddAuthorization(options =>
{
    // Khusus SuperAdmin (misal: kelola data user/pegawai)
    options.AddPolicy("SuperAdminOnly", policy =>
        policy.RequireRole("SuperAdmin"));

    // Hak akses Kasir (otomatis dimiliki juga oleh SuperAdmin)
    options.AddPolicy("KasirAccess", policy =>
        policy.RequireRole("SuperAdmin", "Kasir"));

    // Hak akses Mekanik (otomatis dimiliki juga oleh SuperAdmin)
    options.AddPolicy("MekanikAccess", policy =>
        policy.RequireRole("SuperAdmin", "Mekanik"));

    // Semua staf operasional bengkel di web
    options.AddPolicy("StaffOnly", policy =>
        policy.RequireRole("SuperAdmin", "Kasir", "Mekanik"));
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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
