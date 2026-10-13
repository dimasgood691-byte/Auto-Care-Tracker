"use client";
import { useState, useEffect, FormEvent } from 'react';
import Head from 'next/head';

interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
    phoneNumber: string;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'Admin',
        phoneNumber: '',
    });

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
            const data: User[] = await res.json();
            setUsers(data);
        } catch (err) {
            console.error('Gagal memuat data:', err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('Berhasil mendaftarkan user ke database!');
                setFormData({ fullName: '', email: '', password: '', role: 'Admin', phoneNumber: '' });
                fetchUsers();
            } else {
                alert('Gagal menyimpan data.');
            }
        } catch (err) {
            console.error('Error submitting data:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <Head>
                <title>Auto Care Tracker - Manajemen User</title>
            </Head>

            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Auto Care Tracker — Manajemen Pengguna
                </h1>

                {/* Form Input (POST) */}
                <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-8 space-y-4">
                    <h2 className="text-lg font-semibold text-black">Tambah User Baru</h2>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1">Full Name</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
                        <input
                            type="text"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                    >
                        Simpan ke Database
                    </button>
                </form>

                {/* Daftar User (GET) */}
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Daftar User di SQL Server:</h2>
                {users.length === 0 ? (
                    <p className="text-gray-500 italic">Belum ada data user.</p>
                ) : (
                    <ul className="space-y-3">
                        {users.map((user) => (
                            <li key={user.id} className="border border-gray-200 bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-800">{user.fullName} <span className="text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full ml-2">{user.role}</span></p>
                                    <p className="text-sm text-gray-500">Email: {user.email} | Telp: {user.phoneNumber || '-'}</p>
                                </div>
                                <span className="text-xs text-gray-400">ID: {user.id}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}