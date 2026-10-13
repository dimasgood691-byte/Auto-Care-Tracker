# PROJECT TeFA Wisesa (Auto Care Tracker)
Aplikasi *Auto Care Tracker* dengan arsitektur yang menyatukan manajemen pengguna untuk platform Web (Admin Dashboard menggunakan Next.js) dan Mobile (Client menggunakan Flutter) melalui satu backend terpusat (.NET API) dan database SQL Server.
---

## Tim Developer
|    Nama   |                    Peran                     |                     GitHub                     |
|-----------|----------------------------------------------|------------------------------------------------|
| **Dimas** | Project Lead & Full Stack Developer          | [GitHub](https://github.com/dimasgood691-byte) |
| **Andra** | Backend Web Developer                        | [GitHub](https://github.com/ridwanaulandra)    |
| **Azzam** | Mobile Developer                             | [GitHub](https://github.com/RikuAganeia-sudo)  |
| **Bima**  | Frontend Web Developer                       | 
| **Catur** | Data Analis                                  |
| **Asyraf**| UI & UX Desainer                             |

## [VERSI TECH STACK YANG DIGUNAKAN]
   - **.NET** : 10.0.401 [Backend]
   - **NEXT.JS** : 11.13.0 [FrontendWeb]
   - **Flutter** : 3.47.7 [MobileApp]

## [PROGRES PENGERJAAN]
### 1. Backend Configuration (.NET)

Konfigurasi backend dilakukan untuk menghubungkan aplikasi .NET dengan database SQL Server serta menyediakan REST API yang dapat diakses oleh frontend Next.js dan aplikasi mobile.

#### 1.1. Database Connection

**File:** `appsettings.json`

Konfigurasi connection string untuk menghubungkan aplikasi backend ke database `AutoCareTrackerDB`.

```json
{
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=AutoCareTrackerDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

**Configuration notes:**
- `Server`: Alamat instance SQL Server yang digunakan.
- `Database`: Nama database yang digunakan, yaitu `AutoCareTrackerDB`.
- `Trusted_Connection=True`: Menggunakan Windows Authentication.
- `TrustServerCertificate=True`: Mempercayai sertifikat server tanpa validasi rantai sertifikat. Pengaturan ini umumnya digunakan untuk development lokal, bukan sebagai konfigurasi default production.

> **Security note:** Untuk production, simpan connection string melalui environment variables atau secret management. Hindari menyimpan kredensial sensitif di repository.

#### 1.2. Application Entry Point and Middleware

**File:** `Program.cs`

Berfungsi sebagai entry point aplikasi untuk mengatur dependency injection, database connection, middleware, dan HTTP request pipeline.

Konfigurasi utama meliputi:
- Registrasi `AppDBContext` menggunakan Entity Framework Core dengan provider SQL Server.
- Konfigurasi CORS (*Cross-Origin Resource Sharing*) agar frontend Next.js dapat mengakses backend.
- Registrasi controller untuk menangani HTTP requests.
- Pemetaan endpoint melalui `MapControllers()`.

#### 1.3. User Entity Model

**File:** `Models/User.cs`

Model `User` merepresentasikan entitas pengguna yang disimpan dalam tabel `Users` pada database SQL Server.

Sistem menggunakan satu entitas pengguna dengan atribut `Role` untuk membedakan jenis akun:
- **Admin:** Akun administrator dengan hak akses pengelolaan sistem.
- **Customer:** Akun pelanggan yang menyimpan informasi profil, seperti nama lengkap dan nomor telepon.

Beberapa properti dapat menggunakan nullable types untuk mengakomodasi kebutuhan data yang berbeda. Namun, validasi tetap harus diterapkan sesuai peran dan kebutuhan bisnis agar data yang wajib diisi tidak tersimpan dalam kondisi kosong.

#### 1.4. Users REST API Controller

**File:** `Controllers/UsersController.cs`

Controller ini menangani HTTP requests yang berkaitan dengan data pengguna melalui REST API.

Endpoint yang dikembangkan:
- `GET`: Mengambil data pengguna.
- `POST`: Membuat atau mendaftarkan pengguna baru dari frontend web maupun aplikasi mobile.

Setiap endpoint perlu menerapkan validasi input, penanganan error, dan mekanisme autentikasi serta otorisasi sesuai kebutuhan aksesnya.

#### 1.5. Database Context

**File:** `Data/AppDBContext.cs`

`AppDBContext` merupakan penghubung antara model aplikasi berbasis C# dan database SQL Server melalui Entity Framework Core.

Tanggung jawab utamanya:
- Mengelola koneksi dan interaksi dengan database.
- Memetakan entitas `User` ke tabel `Users`.
- Menyediakan akses data melalui `DbSet<User>`.
- Mendukung operasi database dan migrasi skema melalui Entity Framework Core.

---

### 2. Frontend Configuration (Next.js)

Frontend Next.js menggunakan environment variable untuk menentukan base URL backend REST API.

#### 2.1. Environment Variables

**File:** `.env.local`

Tambahkan konfigurasi berikut pada root directory project Next.js:

```env
NEXT_PUBLIC_API_URL=http://localhost:5083/api
```


   ### set up project Flutter

## Langkah Instalasi
#### [1] Clone Repository

```bash
git clone https://github.com/dimasgood691-byte/Auto-Care-Tracker.git
cd "Project Auto Care Tracker"
```

#### [2] Setup Database SQL Server

```SQL
CREATE DATABASE AutoCareTrackerDB;
```

#### [3] Menjalankan Backend .NET

```bash
cd AutoCareTracker.API
```

Periksa file appsettings.json dan pastikan Connection String-nya sudah mengarah ke database lokal Anda:

```JSON
   "ConnectionStrings": {
   "DefaultConnection": "Server=localhost;Database=AutoCareTrackerDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

Pulihkan paket .NET (Restore) :

```bash
dotnet restore
```

Jalankan migrasi database untuk membuat table secara otomatis :

```bash
dotnet ef database update
```

Jalankan server backend :

```bash
dotnet run #backend API berjalan di http://localhost:5083
```

### [4] Menjalankan Frontend Web (NEXT.JS)

```bash
cd web_auto_care_tracker
```

Buat file bernama .env.local di dalam folder web_auto_care_tracker, lalu tambahkan baris konfigurasi berikut:

```
NEXT_PUBLIC_API_URL=http://localhost:5083/api
```

install seluruh library atau dependencies web :

```bash
npm install
```

jalankan server NEXT.JS :

```bash
npm run dev #frontend web berjalan di http://localhost:3000
```