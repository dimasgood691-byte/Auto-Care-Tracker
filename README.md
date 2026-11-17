# PROJECT TeFA Wisesa (Auto Care Tracker)
Sistem informasi manajemen bengkel kendaraan terintegrasi: web admin, aplikasi mobile pelanggan, halaman pelacakan servis publik, backend REST API, dan database SQL Server.
---

## Tim Developer
|    Nama   |                    Peran                     |                     GitHub                     |
|-----------|----------------------------------------------|------------------------------------------------|
| **Dimas** | Project Lead & Full Stack Web Developer      | [GitHub](https://github.com/dimasgood691-byte) |
| **Andra** | Backend Web Developer                        | [GitHub](https://github.com/ridwanaulandra)    |
| **Azzam** | Full Stack Mobile Developer                  | [GitHub](https://github.com/Azzamwahyudin1)    |
| **Bima**  | Frontend Web Developer                       | [GitHub](https://github.com)
| **Catur** | Data Analyst                                 | [GitHub](https://github.com)
| **Asyraf**| UI & UX Desainer                             | [GitHub](https://github.com)

## [VERSI TECH STACK YANG DIGUNAKAN]
   - **.NET** : 10.0.401 [Backend]
   - **NEXT.JS** : 16.4.3 [FrontendWeb]
   - **Flutter** : 3.47.7 [MobileApp]

## [PROGRES PENGERJAAN]
### 1. Backend Configuration & Architecture (.NET 10)

Konfigurasi backend dilakukan untuk menghubungkan aplikasi .NET 10 dengan database SQL Server serta menyediakan REST API lengkap yang dapat diakses oleh frontend Web Admin (Next.js) dan aplikasi Mobile Client (Flutter).

**Package yang diperlukan:**
```bash
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Swashbuckle.AspNetCore
```

#### 1.1. Database Connection

**File:** `appsettings.json`

Konfigurasi *connection string* untuk menghubungkan aplikasi backend ke database `AutoCareTrackerDB`.

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
- `TrustServerCertificate=True`: Mempercayai sertifikat server tanpa validasi rantai sertifikat untuk kebutuhan *development* lokal.
---

#### 1.2. Application Entry Point and Middleware

**File:** `Program.cs`

Berfungsi sebagai *entry point* aplikasi untuk mengatur *dependency injection*, koneksi database, dokumentasi API, *middleware*, dan *HTTP request pipeline*.

Konfigurasi utama meliputi:
- Registrasi `AppDbContext` menggunakan Entity Framework Core dengan provider SQL Server.
- Konfigurasi CORS (*Cross-Origin Resource Sharing*) agar frontend Next.js dan Flutter dapat mengakses backend.
- Integrasi **Swagger UI** (`AddSwaggerGen`, `UseSwagger`, `UseSwaggerUI`) sebagai dokumentasi interaktif dan alat pengujian *endpoint* REST API.
- Registrasi controller dan pemetaan *endpoint* melalui `MapControllers()`.

---

#### 1.3. Entity Models (Workshop Database Schema)

**Folder:** `Models/`

Sistem dirancang menggunakan pendekatan **Single All-in-One Admin** untuk operasional website (mencakup manajemen admin, pencatatan mekanik, dan kasir) serta akun **Customer** untuk pengguna aplikasi mobile. Seluruh skema direpresentasikan ke dalam 8 model entitas utama:

1. **`User.cs` (`Users`):** Menyimpan data pengguna dengan pembeda atribut `Role` (`Admin` dan `Customer`). Properti `Fullname` dan `PhoneNumber` diatur *nullable* untuk mengakomodasi akun Admin yang minimalis.
2. **`Vehicle.cs` (`Vehicles`):** Menyimpan data kendaraan milik pelanggan (`OwnerId`, `PlateNumber`, `Brand`, `Model`, `Year`, `CurrentOdometerKm`).
3. **`Sparepart.cs` (`Spareparts`):** Menyimpan master data dan inventaris suku cadang (`Sku`, `Name`, `Unit`, `StockQty`, `MinStock`, `UnitPrice`).
4. **`WorkOrder.cs` (`WorkOrders`):** Menyimpan tiket servis kendaraan (`WoNumber`, `VehicleId`, `MechanicName`, `Complaint`, `Status`, `OdometerInKm`, `StartedAt`, `FinishedAt`). Menggunakan atribut `MechanicName` bertipe *string* agar Admin dapat langsung mencatat nama teknisi tanpa memerlukan akun login terpisah bagi mekanik.
5. **`WorkOrderService.cs` (`WorkOrderServices`):** Mencatat rincian deskripsi dan biaya jasa pengerjaan pada setiap *Work Order*.
6. **`WorkOrderItem.cs` (`WorkOrderItems`):** Mencatat pemakaian suku cadang pada *Work Order* beserta penguncian harga satuan saat transaksi (`UnitPrice` *historical pricing*).
7. **`ProgressPhoto.cs` (`ProgressPhotos`):** Menyimpan dokumentasi foto tahapan pengerjaan servis (`FileKey`, `Caption`) untuk fitur pelacakan *real-time* pelanggan di aplikasi mobile.
8. **`Invoice.cs` (`Invoices`):** Menyimpan data tagihan dan kasir (`ServiceTotal`, `PartsTotal`, `GrandTotal`, `PaymentStatus`, `PaymentMethod`, `IssuedAt`, `PaidAt`).

---

#### 1.4. Database Context & Indexing

**File:** `Data/AppDbContext.cs`

`AppDbContext` merupakan penghubung antara seluruh model entitas C# dan database SQL Server melalui Entity Framework Core.

Tanggung jawab utamanya:
- Mengelola koneksi dan interaksi ke seluruh 8 tabel melalui properti `DbSet<T>`.
- Menerapkan aturan integritas data melalui `OnModelCreating`, termasuk pembuatan **Unique Index** pada:
  - `Vehicle.PlateNumber` (Nomor plat kendaraan tidak boleh ganda).
  - `Sparepart.Sku` (Kode SKU suku cadang harus unik).
  - `WorkOrder.WoNumber` (Nomor surat perintah kerja harus unik).

---

#### 1.5. REST API Controllers & Business Logic

**Folder:** `Controllers/`

Seluruh kebutuhan operasional bengkel diekspos melalui 5 *controller* utama:

1. **`UsersController.cs` (`/api/users`):**
   - Menangani pengambilan daftar pengguna (`GET`) dan registrasi pengguna baru (`POST`) baik untuk Admin maupun Customer.
2. **`VehiclesController.cs` (`/api/vehicles`):**
   - Mengelola data kendaraan pelanggan (`GET`, `POST`) serta menyediakan *endpoint* khusus `/api/vehicles/owner/{ownerId}` bagi aplikasi Flutter untuk menampilkan daftar mobil milik pelanggan tertentu.
3. **`SparepartsController.cs` (`/api/spareparts`):**
   - Mengelola katalog inventaris suku cadang (`GET`, `POST`, `PUT`) untuk pemantauan stok di dashboard Admin.
4. **`WorkOrdersController.cs` (`/api/workorders`):**
   - Menangani pembuatan *Work Order* baru dengan penomoran otomatis (`WO-YYYYMMDD-XXX`) dan pembaruan kilometer (`CurrentOdometerKm`) otomatis pada tabel kendaraan.
   - Menyediakan *endpoint* pembaruan status pengerjaan (`Pending`, `InProgress`, `Completed`) dan pencatatan waktu mulai/selesai otomatis.
   - Menangani penambahan jasa servis (`/services`), pengunggahan foto progres (`/photos`), serta pemakaian suku cadang (`/items`) yang **secara otomatis memotong jumlah stok (`StockQty`)** di tabel `Spareparts`.
5. **`InvoicesController.cs` (`/api/invoices`):**
   - Menyediakan fitur kalkulasi tagihan otomatis (`/generate/{workOrderId}`) yang menjumlahkan seluruh biaya jasa (`ServiceTotal`) dan suku cadang (`PartsTotal`) menjadi `GrandTotal`.
   - Menangani proses pembayaran kasir (`/pay`) untuk mengubah status tagihan menjadi `Paid` beserta metode pembayarannya (`Cash`, `QRIS`, `Transfer`).

---

#### 1.6. Database Migration & End-to-End API Testing

Skema database telah disinkronisasikan ke SQL Server menggunakan Entity Framework Core Migrations:

```bash
dotnet ef migrations add AddCompleteWorkshopSchema
dotnet ef database update
```

**Status Pengujian:**
Seluruh *endpoint* REST API telah diuji secara berurutan (*end-to-end*) melalui **Swagger UI** (`http://localhost:5083/swagger`)—mulai dari pembuatan akun Customer, registrasi kendaraan, input stok suku cadang, pembuatan *Work Order*, pemotongan stok otomatis, hingga penerbitan *Invoice*—dan seluruhnya menghasilkan respons sukses (`200 OK` / `201 Created`).
---

### 2. Frontend Configuration (Next.js)

Frontend Next.js menggunakan environment variable untuk menentukan base URL backend REST API.

#### 2.1. Environment Variables

**File:** `.env.local`

Tambahkan konfigurasi berikut pada root directory project Next.js:

```env
NEXT_PUBLIC_API_URL=http://localhost:5083/api
```

### 3. Membuat Page Login Admin (Next.js)

Dalam pengerjaan halaman login di `page.tsx`, tidak ada library eksternal tambahan yang di-install di luar bawaan proyek. Seluruh fitur dan efek visual dibangun menggunakan tech stack yang sudah terdaftar di `package.json`:

1. **Library Utama (Bawaan Project)**
   - **React (react v19.3.0)**
     - Digunakan untuk hooks bawaan yaitu `useState` dan `useEffect` (mengelola input email/password, deteksi Caps Lock, fitur Ingat Email, serta melacak posisi koordinat kursor x, y untuk efek spotlight).
   - **Next.js (next v16.4.0 — modul next/navigation & next/font/google)**
     - Menggunakan `useRouter` dari `next/navigation` untuk mengarahkan pengguna (redirect) setelah login berhasil.
     - Menggunakan font Geist dan Geist_Mono dari `next/font/google` di `layout.tsx`.
   - **Tailwind CSS v4 (tailwindcss & @tailwindcss/turbopack)**
     - Digunakan untuk seluruh desain responsif (split-screen), efek glassmorphism (backdrop-blur), gradasi warna, shadow, dan transisi interaktif.

2. **Teknik Native (Tanpa Library Tambahan)**
   - **CSS Keyframes Murni (globals.css):** Animasi getar saat error (`animate-shake`), lencana melayang (`animate-float`), dan bola cahaya bergerak (`animate-blob`) ditulis menggunakan `@keyframes` CSS murni tanpa library animasi seperti Framer Motion.
   - **Inline SVG:** Seluruh ikon (logo, email, gembok, mata show/hide password, peringatan) menggunakan kode `<svg>` langsung di JSX, sehingga tidak perlu menginstal library ikon seperti lucide-react atau react-icons.
   - **Browser Web API (fetch & localStorage):** Menggunakan `fetch()` bawaan browser untuk memanggil endpoint REST API .NET (`/api/users/login`) dan `localStorage` untuk menyimpan sesi admin serta preferensi ingat email.

### 4. Configuration Token JWT untuk Login

Selain membuat halaman login, konfigurasi keamanan di sisi *backend* (.NET 10) juga telah ditingkatkan menggunakan JSON Web Token (JWT). Konfigurasi yang dilakukan meliputi:

1. **Instalasi Package Keamanan:** Menambahkan paket resmi `Microsoft.AspNetCore.Authentication.JwtBearer` ke proyek .NET.
2. **Konfigurasi Kunci Rahasia:** Menambahkan pengaturan `"Jwt"` di dalam file `appsettings.json`, yang berisi `Key` (Kunci rahasia panjang), `Issuer`, dan `Audience`.
3. **Registrasi Middleware (Program.cs):**
   - Mendaftarkan layanan Autentikasi (`AddAuthentication`) dengan pengaturan validasi JWT.
   - Menambahkan `app.UseAuthentication()` dan `app.UseAuthorization()` ke dalam pipeline request untuk memvalidasi token setiap kali ada request masuk.
4. **Generasi Token (UsersController.cs):** Memisahkan endpoint *Register* dengan endpoint khusus *Login* (`[HttpPost("login")]`). Saat kredensial valid, backend men-generate *Token JWT* (berisi *payload* aman seperti UserID dan Role) yang akan kedaluwarsa secara otomatis. Token ini dikirimkan kembali ke klien untuk digunakan sebagai otorisasi pada aktivitas selanjutnya.

### 5. Arsitektur HTTP-Only Cookie, Server Actions & Middleware (Next.js)
Untuk meningkatkan keamanan sesi autentikasi di sisi *frontend* web (Next.js) dan mencegah serangan XSS (*Cross-Site Scripting*), penyimpanan token JWT kini dipindahkan dari `localStorage` ke **HTTP-Only Cookie**:
1. **Server Actions (`app/actions/auth.tsx`):**
   - `loginAdmin`: Menangani proses *login* dari sisi *server* Next.js ke *endpoint* `/api/users/login` (.NET), memvalidasi bahwa *role* pengguna termasuk staf operasional bengkel (`SuperAdmin`, `Kasir`, atau `Mekanik`), lalu menanamkan token JWT ke dalam *cookie* `admin_token` dan `user_role` dengan atribut `httpOnly: true`, `sameSite: "lax"`, dan masa aktif 3 jam.
   - `logoutAdmin`: Menghapus *cookie* `admin_token` dan `user_role` secara aman dari sisi *server* lalu mengarahkan pengguna kembali ke `/login`.
2. **Route Protection Middleware (`middleware.ts`):**
   - Memproteksi seluruh rute `/dashboard/:path*` dengan memvalidasi keberadaan token, mengekstrak klaim `role` langsung dari *payload* JWT, serta memeriksa masa berlaku token (`exp`).
   - Menerapkan pembatasan akses sub-rute berbasis *role* (misalnya halaman `/dashboard/users` hanya dapat diakses oleh `SuperAdmin`).
   - Mencegah staf yang sudah terautentikasi kembali ke halaman `/login` sebelum melakukan *logout*.

### 6. Role-Based Authorization Policy, Password Hashing & Proteksi Endpoint (.NET 10)
Keamanan *backend* REST API ditingkatkan melalui penerapan hierarki hak akses (*Role-Based Authorization Policy*) dan enkripsi kata sandi:
1. **Konfigurasi Role Hierarchy Policy (`Program.cs`):**
   - `SuperAdminOnly`: Akses penuh khusus `SuperAdmin` (manajemen akun staf/pengguna).
   - `KasirAccess`: Dapat diakses oleh `SuperAdmin` dan `Kasir` (penerimaan kendaraan, pembuatan *Work Order*, pembuatan *Invoice*, dan pembayaran kasir).
   - `MekanikAccess`: Dapat diakses oleh `SuperAdmin` dan `Mekanik` (pembaruan status pengerjaan servis, input jasa, pemakaian suku cadang, foto progres, serta pengelolaan stok *sparepart*).
   - `StaffOnly`: Dapat diakses oleh seluruh staf operasional web (`SuperAdmin`, `Kasir`, `Mekanik`).
2. **Password Hashing & Proteksi Data Sensitif (`UsersController.cs` & `User.cs`):**
   - Menggunakan `PasswordHasher<User>` (`Microsoft.AspNetCore.Identity`) untuk melakukan *hashing* kata sandi saat pembuatan akun baru (`POST /api/users` dan `POST /api/users/register`), dilengkapi mekanisme *auto-migration* bagi akun lama yang masih menggunakan *plain-text*.
   - Menambahkan atribut `[JsonIgnore]` pada properti `PasswordHash` di `User.cs` agar *hash* kata sandi tidak pernah terekspos pada respons JSON API.
   - Menambahkan *endpoint* publik `POST /api/users/register` (`[AllowAnonymous]`) khusus bagi registrasi pelanggan di aplikasi *mobile* Flutter, serta validasi pencegahan duplikasi email.
3. **Integrasi JWT Bearer pada Swagger UI (`Program.cs`):**
   - Menambahkan konfigurasi `AddSecurityDefinition("Bearer")` dan `AddSecurityRequirement` pada Swagger UI untuk memudahkan pengujian *endpoint* yang diproteksi `[Authorize]`.

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
