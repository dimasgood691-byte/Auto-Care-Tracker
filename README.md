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
   ### connect in dan configurasi .NET agar terhubung ke DB SQL Server [DBName->AutoCareTrackerDB] dan configurasi agar bisa terhubung dengan NEXT.JS.
   **Configurasi .NET**
   [1] [appsettings.json] : konfigurasi connection string anda ke sql server di sini.
  ```
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=AutoCareTrackerDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }```
  ```
   [2] [Program.cs] : file utama untuk mendaftarkan layanan, konfigurasi DbContext SQL Server, middleware CORS agar bisa diakses oleh Next.js, dan pemetaan controller.
   [3] Model [User] : satu tabel terpusat (Users) yang efisien untuk menampung dua peran (Role): Admin dan Customer, telah disesuaikan menjadi nullable (fleksibel) agar akun     Admin (yang cukup membutuhkan Email dan Password) maupun Customer (yang membutuhkan data lengkap seperti Fullname dan PhoneNumber) dapat tersimpan dengan baik di SQL Server.
   [4] Controller [UsersController] : Menangani logika endpoint REST API untuk melakukan GET (mengambil daftar user) dan POST (mendaftarkan user baru dari web/mobile).
   [5] Data [AppDBContext] : jembatan penghubung antara entitas C# (User) dengan database SQL Server via Entity Framework Core.
   **Configurasi NEXT.JS**
   membuat file _.env.local_ disini dengan : [NEXT_PUBLIC_API_URL=http://localhost:5083/api]

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