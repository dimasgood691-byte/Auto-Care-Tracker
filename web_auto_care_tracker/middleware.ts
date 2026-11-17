import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_WEB_ROLES = ["SuperAdmin", "Kasir", "Mekanik"];

// Fungsi untuk mengekstrak role langsung dari dalam payload JWT sekaligus mengecek masa berlaku (exp)
function getRoleFromJwt(token: string): string | null {
    try {
        const payloadBase64 = token.split(".")[1];
        if (!payloadBase64) return null;

        const normalizedBase64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        const paddedBase64 = normalizedBase64.padEnd(
            normalizedBase64.length + ((4 - (normalizedBase64.length % 4)) % 4),
            "="
        );
        const payloadJson = atob(paddedBase64);
        const payload = JSON.parse(payloadJson);

        // Cek apakah token sudah kadaluarsa (expired)
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return null;
        }

        // Membaca claim role standar maupun format schema .NET ClaimTypes.Role
        return (
            payload.role ||
            payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
            null
        );
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get("admin_token")?.value;
    const role = token ? getRoleFromJwt(token) : null;
    const { pathname } = request.nextUrl;

    const isAuthenticated = Boolean(
        token && role && ALLOWED_WEB_ROLES.includes(role)
    );

    // 1. Proteksi halaman /dashboard beserta seluruh sub-rutenya
    if (pathname.startsWith("/dashboard")) {
        if (!isAuthenticated) {
            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("admin_token");
            response.cookies.delete("user_role");
            return response;
        }

        // Pembatasan sub-rute berdasarkan Role dari dalam token JWT
        if (pathname.startsWith("/dashboard/users") && role !== "SuperAdmin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // 2. Jika sudah login, cegah staf kembali ke halaman /login
    if (pathname === "/login" && isAuthenticated) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};