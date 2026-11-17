"use client";

import { useState } from "react";
import { logoutAdmin } from "@/app/actions/auth";

export default function Dashboard() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logoutAdmin();
    }
    return (
        <div className="p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard Bengkel</h1>

                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                    {isLoggingOut ? "Keluar..." : "Logout"}
                </button>
            </div>
        </div>
    );
}