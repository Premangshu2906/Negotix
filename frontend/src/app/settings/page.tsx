'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useStore } from '@/store/useStore';

export default function SettingsPage() {
    const { user } = useStore();
    const router = useRouter();

    const [address, setAddress] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/me');
                setAddress(res.data.address || '');
                setBankAccount(res.data.bankAccount || '');
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            await api.put('/users/profile', { address, bankAccount });
            setMessage('Profile updated successfully!');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-16 h-16"
                >
                    <img src="/images/logo.png" alt="Loading" className="object-contain w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-8 py-16 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/10 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-xl"
            >
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">
                        SELLER <span className="text-blue-500">PROFILE</span>
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">Manage your shipping address and payout methods.</p>
                </div>

                {message && (
                    <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="mt-8 space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-400">Shipping / Business Address</label>
                        <textarea
                            rows={3}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="123 Commerce St, Suite 400..."
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-400">Bank Account Details for Payouts</label>
                        <input
                            type="text"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="e.g. ACH Routing / Account Number"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="group relative w-full overflow-hidden rounded-xl bg-blue-600 px-4 py-4 font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                    >
                        <span className="relative z-10">{saving ? 'Saving...' : 'Save Profile Details'}</span>
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
