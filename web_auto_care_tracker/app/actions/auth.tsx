"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAdmin(email: string, password: string) {
    try {
        //1. next server menembak ke backend .NET
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            return { error: data.message || "Email atau password salah." };
        }

        //2. jika sukses, tanam token ke http-only cookie | Catatan: Di Next.js terbaru, cookies() bersifat asynchronous
        const cookieStore = await cookies();
        cookieStore.set({
            name: "admin_token",
            value: data.token,
            httpOnly: true, //kunci utama : tidak bisa di baca oleh JS/XSS
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/dashboard",
            maxAge: 60 * 60 * 3, //hangus dalam 3 jam (sesuai dengan di backend)
        });

        cookieStore.set({
            name: "user_role",
            value: data.user.role,
            httpOnly: false, // False agar bisa dibaca komponen UI di client jika diperlukan
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 3,
        });

    } catch {
        return { error: "Terjadi kesalahan saat menghubungi server backend." };
    }

    // 3. lakukan redirect ke dashboard (harus di luar try-catch)
    redirect("/dashboard");
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
    cookieStore.delete("user_role");
    redirect("/login");
}