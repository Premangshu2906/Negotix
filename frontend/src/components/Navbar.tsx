'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
    subscriptionTier?: string;
}

export function Navbar() {
    const { user, logout } = useStore();
    const router = useRouter();
    const [isHelpOpen, setIsHelpOpen] = React.useState(false);
    const [helpMessage, setHelpMessage] = React.useState('');
    const [helpStatus, setHelpStatus] = React.useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const submitHelp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!helpMessage.trim()) return;

        setHelpStatus('sending');
        try {
            await api.post('/support', { message: helpMessage });
            setHelpStatus('success');
            setTimeout(() => {
                setIsHelpOpen(false);
                setHelpMessage('');
                setHelpStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Support error:', error);
            setHelpStatus('error');
            setTimeout(() => setHelpStatus('idle'), 3000);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-black/80 px-8 py-5 backdrop-blur-md">
                <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
                    {user ? (
                        <div className="relative h-10 w-32">
                            <img src="/images/logo.png" alt="Negotix Logo" className="object-contain w-full h-full" />
                        </div>
                    ) : (
                        <h1 className="text-2xl font-black tracking-tighter text-white">
                            NEGOTI<span className="text-blue-500">X</span>
                        </h1>
                    )}
                </Link>

                <div className="flex items-center space-x-6">
                    {user ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="text-sm font-semibold text-gray-300 transition-colors hover:text-white"
                            >
                                Dashboard
                            </Link>

                            {user.role === 'SELLER' && (
                                <>
                                    <Link
                                        href="/sell"
                                        className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
                                    >
                                        Sell Item
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="text-sm font-semibold text-gray-300 transition-colors hover:text-white"
                                    >
                                        Seller Profile
                                    </Link>
                                </>
                            )}

                            <Link
                                href="/pricing"
                                className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transition-opacity hover:opacity-80"
                            >
                                Upgrade
                            </Link>

                            <button
                                onClick={() => setIsHelpOpen(true)}
                                className="text-sm font-semibold text-gray-300 transition-colors hover:text-white"
                            >
                                Help
                            </button>

                            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/10">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-bold text-white flex items-center space-x-2">
                                        <span>{user.name}</span>
                                        {user.subscriptionTier && user.subscriptionTier !== 'FREE' && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${user.subscriptionTier === 'PRO' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                }`}>
                                                {user.subscriptionTier}
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500 mt-0.5">{user.role}</span>
                                </div>
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 font-bold text-white shadow-lg">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="ml-2 text-sm font-medium text-gray-500 hover:text-red-400 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-semibold text-gray-300 transition-colors hover:text-white"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </header>

            {/* Helpline Modal - Moved outside the header to ensure it sits on top of the whole page */}
            <AnimatePresence>
                {isHelpOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                            <h2 className="text-2xl font-bold text-white mb-2">Customer Helpline</h2>
                            <p className="text-sm text-gray-400 mb-6">Describe your issue below and our support team will investigate.</p>

                            <form onSubmit={submitHelp}>
                                <textarea
                                    className="w-full rounded-xl border border-gray-700 bg-black/50 p-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-32"
                                    placeholder="I'm having trouble with..."
                                    value={helpMessage}
                                    onChange={(e) => setHelpMessage(e.target.value)}
                                    disabled={helpStatus === 'sending' || helpStatus === 'success'}
                                    required
                                />

                                {helpStatus === 'error' && (
                                    <p className="mt-2 text-sm text-red-500 font-medium">Failed to send message. Please try again.</p>
                                )}
                                {helpStatus === 'success' && (
                                    <p className="mt-2 text-sm text-green-500 font-medium">Message sent successfully! We'll be in touch.</p>
                                )}

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsHelpOpen(false)}
                                        className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                                        disabled={helpStatus === 'sending'}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={helpStatus === 'sending' || helpStatus === 'success' || !helpMessage.trim()}
                                        className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {helpStatus === 'sending' ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
