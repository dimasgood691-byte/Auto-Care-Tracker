"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    // State Management
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberEmail, setRememberEmail] = useState(false);

    // UI & UX States
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [shakeError, setShakeError] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);
    const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

    // Interactive Cursor Spotlight State (Panel Kiri & Panel Kanan)
    const [leftMouse, setLeftMouse] = useState({ x: 300, y: 300 });
    const [rightMouse, setRightMouse] = useState({ x: 400, y: 400 });
    const [cardGlare, setCardGlare] = useState({ x: 50, y: 50 });

    // Deteksi Caps Lock saat mengetik password
    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.getModifierState) {
            setCapsLockOn(e.getModifierState("CapsLock"));
        }
    };

    // Efek Spotlight mengikuti kursor di panel kiri (tanpa mengubah teks & kartu)
    const handleLeftPanelMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setLeftMouse({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    // Efek Spotlight mengikuti kursor di background putih sebelah kanan
    const handleRightPanelMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setRightMouse({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    // Efek kilau cahaya (glare) mengikuti kursor di atas kartu login (tanpa memiringkan kartu)
    const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCardGlare({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100,
        });
    };

    const triggerError = (msg: string) => {
        setError(msg);
        setShakeError(false);
        setTimeout(() => setShakeError(true), 10);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || "Terjadi kesalahan saat menghubungi server.");
            }

            if (rememberEmail) {
                localStorage.setItem("autocare_remembered_email", email.trim());
            } else {
                localStorage.removeItem("autocare_remembered_email");
            }

            localStorage.setItem("admin_session", JSON.stringify(data));
            setSuccess(true);
            router.push("/dashboard");
        } catch (err: any) {
            if (err.message === "Failed to fetch" || err.name === "TypeError") {
                triggerError("Gagal terhubung ke server. Pastikan server API (.NET) sedang berjalan.");
            } else {
                triggerError(err.message || "Gagal masuk. Silakan periksa kembali kredensial Anda.");
            }
            setLoading(false);
        }
    };

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    const features = [
        {
            title: "Manajemen Work Order",
            desc: "Pantau antrean servis, keluhan pelanggan, dan penugasan mekanik secara real-time.",
            icon: (
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
        },
        {
            title: "Inventaris Suku Cadang Otomatis",
            desc: "Pemotongan stok sparepart otomatis saat digunakan pada pengerjaan servis.",
            icon: (
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
        },
        {
            title: "Kasir & Invoicing Terintegrasi",
            desc: "Kalkulasi biaya jasa & suku cadang instan dengan dukungan multi-metode pembayaran.",
            icon: (
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen w-full flex bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
            {/* ================= PANEL KIRI: TEKS & KARTU AWAL + EFEK CURSOR SPOTLIGHT ================= */}
            <div
                onMouseMove={handleLeftPanelMouseMove}
                className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative bg-slate-950 text-white p-12 xl:p-16 flex-col justify-between overflow-hidden"
            >
                {/* Efek Cahaya Spotlight Mengikuti Gerakan Kursor */}
                <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(650px circle at ${leftMouse.x}px ${leftMouse.y}px, rgba(37, 99, 235, 0.20), rgba(6, 182, 212, 0.07) 35%, transparent 65%)`,
                    }}
                />

                {/* Dekorasi Background Cahaya & Grid */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Top Bar: Logo & Brand */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3.5 group">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30 ring-1 ring-white/15 group-hover:scale-105 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white group-hover:rotate-45 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className="font-bold text-lg tracking-tight text-white block leading-none">
                                Auto Care Tracker
                            </span>
                            <span className="text-xs text-slate-400 font-medium mt-1 block">
                                TeFA Wisesa Workshop System
                            </span>
                        </div>
                    </div>
                </div>

                {/* Konten Utama Kiri */}
                <div className="relative z-10 my-auto py-8 max-w-xl">
                    <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
                        Kendalikan seluruh operasional bengkel dalam{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                            satu dashboard.
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm xl:text-base mt-4 leading-relaxed">
                        Mulai dari penerimaan kendaraan, pencatatan mekanik & dokumentasi progres servis, hingga manajemen stok suku cadang dan kasir terintegrasi.
                    </p>

                    {/* Daftar Fitur Utama (3 Kartu Tetap Seperti Awal + Efek Hover Halus) */}
                    <div className="mt-8 space-y-3.5">
                        {features.map((item, idx) => (
                            <div
                                key={idx}
                                className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-blue-400/30 transition-all duration-300"
                            >
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 group-hover:border-blue-400/30 group-hover:scale-105 transition-all duration-300 shrink-0 mt-0.5">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Kiri */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-white/10 pt-6">
                    <span>© 2026 Auto Care Tracker — Project TeFA Wisesa</span>
                </div>
            </div>

            {/* ================= PANEL KANAN: BACKGROUND PUTIH INTERAKTIF & BER-EFEK ================= */}
            <div
                onMouseMove={handleRightPanelMouseMove}
                className="w-full lg:w-[48%] xl:w-[45%] flex flex-col justify-center items-center px-6 py-12 sm:px-12 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/50"
            >
                {/* 1. Efek Cursor-Following Spotlight di Background Putih */}
                <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(550px circle at ${rightMouse.x}px ${rightMouse.y}px, rgba(59, 130, 246, 0.13), rgba(6, 182, 212, 0.06) 40%, transparent 70%)`,
                    }}
                />

                {/* 2. Pola Titik-Titik (Dot Matrix Pattern) Modern */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-60"
                    style={{
                        backgroundImage: "radial-gradient(#cbd5e1 1.25px, transparent 1.25px)",
                        backgroundSize: "24px 24px",
                        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 35%, transparent 100%)",
                        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 35%, transparent 100%)",
                    }}
                />

                {/* 3. Animated Floating Gradient Orbs (Blobs) di Belakang Kartu */}
                <div className="pointer-events-none absolute top-12 -right-16 w-72 h-72 bg-gradient-to-br from-blue-400/25 to-cyan-300/25 rounded-full blur-3xl animate-blob" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-300/25 rounded-full blur-3xl animate-blob-delayed" />

                {/* Container Kartu Login */}
                <div className="w-full max-w-md relative z-10">
                    {/* Identitas Brand (Tampil di Mobile/Tablet) */}
                    <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-600/25">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className="font-bold text-lg text-slate-900 block leading-none">
                                Auto Care Tracker
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                                Portal Admin Bengkel
                            </span>
                        </div>
                    </div>

                    {/* Wrapper Glow & Interactive Cursor Glare Card (Tanpa mengubah/memiringkan kartu & teks) */}
                    <div
                        onMouseMove={handleCardMouseMove}
                        className={`relative group rounded-3xl p-[1.5px] bg-gradient-to-br from-blue-500/30 via-slate-200/80 to-cyan-500/30 hover:from-blue-600/60 hover:via-cyan-400/50 hover:to-indigo-600/60 transition-all duration-500 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.16)] hover:shadow-[0_25px_70px_-12px_rgba(37,99,235,0.26)] ${
                            shakeError ? "animate-shake" : ""
                        }`}
                    >
                        {/* Kartu Form Login Glassmorphism */}
                        <div className="relative bg-white/92 backdrop-blur-2xl rounded-[22.5px] p-8 sm:p-10 overflow-hidden">
                            {/* Top Gradient Accent Line */}
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600" />

                            {/* Efek Kilau Cahaya (Glare) mengikuti Kursor di Dalam Kartu */}
                            <div
                                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background: `radial-gradient(380px circle at ${cardGlare.x}% ${cardGlare.y}%, rgba(59, 130, 246, 0.07), transparent 65%)`,
                                }}
                            />

                            {/* Header Form dengan Floating Icon Badge */}
                            <div className="relative z-10 mb-7">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-xs font-semibold border border-blue-200/60 shadow-2xs">
                                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Akses Khusus Administrator
                                    </div>

                                    {/* Mini Decorative Animated Icon */}
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    Selamat Datang Kembali
                                </h1>
                                <p className="text-sm text-slate-500 mt-1.5">
                                    Masukkan akun admin Anda untuk mengelola operasional bengkel.
                                </p>
                            </div>

                            {/* Notifikasi Error */}
                            {error && (
                                <div
                                    role="alert"
                                    className="relative z-10 mb-6 p-4 bg-red-50/95 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm shadow-sm"
                                >
                                    <div className="p-1 bg-red-100 rounded-lg text-red-600 shrink-0 mt-0.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-red-800 text-xs uppercase tracking-wide mb-0.5">
                                            Autentikasi Gagal
                                        </p>
                                        <p className="text-red-600 text-xs sm:text-sm leading-relaxed">{error}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setError("")}
                                        aria-label="Tutup pesan error"
                                        className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-100/60 transition cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {/* Notifikasi Sukses */}
                            {success && (
                                <div
                                    role="status"
                                    className="relative z-10 mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm shadow-sm"
                                >
                                    <div className="p-1 bg-emerald-100 rounded-lg text-emerald-600 shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-emerald-800 text-xs uppercase tracking-wide">
                                            Login Berhasil
                                        </p>
                                        <p className="text-emerald-600 text-xs sm:text-sm">
                                            Mengalihkan Anda ke halaman utama dashboard...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Form Login */}
                            <form onSubmit={handleLogin} className="relative z-10 space-y-5">
                                {/* Input Email */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label
                                            htmlFor="email"
                                            className={`block text-sm font-semibold transition-colors ${
                                                focusedField === "email" ? "text-blue-600" : "text-slate-700"
                                            }`}
                                        >
                                            Alamat Email
                                        </label>
                                        {email.length > 0 && (
                                            <span
                                                className={`text-[11px] font-medium transition-all ${
                                                    isEmailValid ? "text-emerald-600" : "text-slate-400"
                                                }`}
                                            >
                                                {isEmailValid ? "✓ Email valid" : "Format email..."}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <div
                                            className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-all duration-200 ${
                                                focusedField === "email"
                                                    ? "text-blue-600 scale-110"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.8}
                                                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            disabled={loading || success}
                                            value={email}
                                            onFocus={() => setFocusedField("email")}
                                            onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="admin@gmail.com"
                                            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 text-sm outline-none transition-all duration-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/12 focus:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                        {isEmailValid && (
                                            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-500">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Input Kata Sandi */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label
                                            htmlFor="password"
                                            className={`block text-sm font-semibold transition-colors ${
                                                focusedField === "password" ? "text-blue-600" : "text-slate-700"
                                            }`}
                                        >
                                            Kata Sandi
                                        </label>
                                        {capsLockOn && (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Caps Lock Aktif
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <div
                                            className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-all duration-200 ${
                                                focusedField === "password"
                                                    ? "text-blue-600 scale-110"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.8}
                                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            autoComplete="current-password"
                                            disabled={loading || success}
                                            value={password}
                                            onFocus={() => setFocusedField("password")}
                                            onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onKeyUp={handleKeyUp}
                                            placeholder="Masukkan kata sandi"
                                            className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 text-sm outline-none transition-all duration-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/12 focus:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                            title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Tombol Submit dengan Shimmer Light Sweep Effect */}
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="group/btn relative overflow-hidden w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 active:scale-[0.99] text-white font-semibold py-3.5 px-5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 flex justify-center items-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {/* Kilau Cahaya Menyapu Tombol saat Hover */}
                                    <span className="pointer-events-none absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover/btn:translate-x-[300%] transition-transform duration-700 ease-out" />

                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Memverifikasi Akun...</span>
                                        </>
                                    ) : success ? (
                                        <>
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Berhasil Masuk!</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="relative z-10">Masuk ke Dashboard</span>
                                            <svg
                                                className="relative z-10 w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1.5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Informasi Keamanan / Bantuan */}
                            <div className="relative z-10 mt-7 pt-6 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-500">
                                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="leading-relaxed">
                                    Portal web ini dikhususkan bagi <span className="font-semibold text-slate-700">Admin Bengkel</span>. Pelanggan dapat memantau progres servis melalui aplikasi mobile Auto Care Tracker.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


