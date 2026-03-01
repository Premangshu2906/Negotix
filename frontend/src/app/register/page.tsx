'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

export default function RegisterPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { login } = useStore();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await api.post('/auth/send-otp', { email });
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await api.post('/auth/register', { name, email, password, role, otp });
            login(res.data.user, res.data.token);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to verify and register');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md rounded-3xl border border-white/10 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-xl"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black tracking-tighter">
                        JOIN <span className="text-blue-500">NEGOTIX</span>
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        {step === 1 ? 'Create your premium marketplace account' : 'Verify your email address'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-400">Full Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="John Doe"
                            />
                        </div>

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

                        <div>
                            <label className="mb-3 block text-sm font-medium text-gray-400">I want to...</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('BUYER')}
                                    className={`rounded-xl border py-3 text-sm font-semibold transition-all ${role === 'BUYER'
                                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                        : 'border-white/10 bg-black/50 text-gray-400 hover:border-white/30'
                                        }`}
                                >
                                    Buy Items
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('SELLER')}
                                    className={`rounded-xl border py-3 text-sm font-semibold transition-all ${role === 'SELLER'
                                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                                        : 'border-white/10 bg-black/50 text-gray-400 hover:border-white/30'
                                        }`}
                                >
                                    Sell Items
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full overflow-hidden rounded-xl bg-blue-600 px-4 py-4 font-bold text-white transition hover:bg-blue-500 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10">{isLoading ? 'Sending Code...' : 'Continue'}</span>
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-400">
                                We sent a 6-digit verification code to
                                <br />
                                <span className="font-bold text-white">{email}</span>
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-400 text-center">Verification Code</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // only allow numbers
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-4 text-center text-3xl tracking-[0.5em] text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="000000"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || otp.length !== 6}
                            className="group relative w-full overflow-hidden rounded-xl bg-blue-600 px-4 py-4 font-bold text-white transition hover:bg-blue-500 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10">{isLoading ? 'Verifying...' : 'Verify & Create Account'}</span>
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setOtp('');
                                setError('');
                            }}
                            className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Back to Sign Up
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                        Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
