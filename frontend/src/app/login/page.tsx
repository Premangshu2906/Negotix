'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data.user, res.data.token);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md rounded-3xl border border-white/10 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-xl"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black tracking-tighter">
                        WELCOME <span className="text-blue-500">BACK</span>
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">Sign in to your premium marketplace account</p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-400">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-400">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full overflow-hidden rounded-xl bg-blue-600 px-4 py-4 font-bold text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="relative z-10">{isLoading ? 'Signing in...' : 'Sign In'}</span>
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                        Create one
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
