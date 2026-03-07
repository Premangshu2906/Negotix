'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useStore();
    const router = useRouter();
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchOffers = async () => {
            try {
                const res = await api.get('/offers');
                setOffers(res.data);
            } catch (err) {
                console.error('Failed to fetch offers', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [user, router]);

    const handleOfferAction = async (offerId: string, action: 'accept' | 'reject') => {
        try {
            await api.post(`/offers/${offerId}/${action}`);
            // Refresh offers
            const res = await api.get('/offers');
            setOffers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
            case 'ACCEPTED': return 'text-green-400 bg-green-500/10 border-green-500/30';
            case 'REJECTED': return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'AUTO_COUNTERED': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
        }
    };

    const StatusBadge = ({ status }: { status: string }) => (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusStyle(status)}`}>
            {status.replace('_', ' ')}
        </span>
    );

    return (
        <div className="mx-auto max-w-5xl px-8 py-12">
            <h1 className="text-3xl font-black tracking-tight text-white mb-8">
                YOUR <span className="text-blue-500">DASHBOARD</span>
            </h1>

            {offers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-white/10 rounded-3xl bg-gray-900/20 backdrop-blur-sm text-center">
                    <p className="text-xl font-bold text-gray-500 mb-2">No activity yet.</p>
                    <p className="text-gray-600 mb-6">Start browsing or listing items to see your offers here.</p>
                    <Link
                        href="/"
                        className="rounded-full bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500"
                    >
                        Browse Market
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {offers.map((offer, idx) => {
                        const isBuyer = user?.id === offer.buyerId;

                        return (
                            <motion.div
                                key={offer.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border border-white/10 bg-gray-900/50 p-6 transition hover:bg-gray-800/80"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-bold text-white">{offer.product.title}</h3>
                                        <div className="text-xs font-bold text-gray-500 bg-black px-2 py-1 rounded-md">
                                            {isBuyer ? 'BOUGHT' : 'SOLD'}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                                        <div>
                                            <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Offer</span>
                                            <p className="text-xl font-black text-white mt-1">₹{offer.offerAmount}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Status</span>
                                            <div className="mt-1">
                                                <StatusBadge status={offer.status} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {!isBuyer && offer.status === 'PENDING' && (
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => handleOfferAction(offer.id, 'reject')}
                                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-2.5 font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleOfferAction(offer.id, 'accept')}
                                            className="rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-2.5 font-bold text-green-500 transition hover:bg-green-500 hover:text-white"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
