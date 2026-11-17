"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ALLOWED_WEB_ROLES = ["SuperAdmin", "Kasir", "Mekanik"];

export async function loginAdmin(email: string, password: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            return { error: data.message || "Email atau password salah." };
        }

        const userRole = data.user?.role;
        if (!userRole || !ALLOWED_WEB_ROLES.includes(userRole)) {
            return {
                error: "Akses ditolak! Portal web ini khusus untuk staf operasional bengkel.",
            };
        }

        const cookieStore = await cookies();

        cookieStore.set({
            name: "admin_token",
            value: data.token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 3,
        });

        cookieStore.set({
            name: "user_role",
            value: userRole,
            httpOnly: true, // Dikunci menjadi true agar aman dari manipulasi script client
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 3,
        });
    } catch {
        return { error: "Terjadi kesalahan saat menghubungi server backend." };
    }

    redirect("/dashboard");
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
    cookieStore.delete("user_role");
    redirect("/login");
}