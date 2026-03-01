'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { motion } from 'framer-motion';

export default function PricingPage() {
    const { user, login } = useStore();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [isAnnual, setIsAnnual] = useState(false);

    const handleUpgrade = async (tier: 'FREE' | 'PRO' | 'PREMIUM') => {
        if (!user) {
            router.push('/login');
            return;
        }

        setLoading(tier);
        try {
            const res = await api.post('/users/upgrade', { tier });
            // Re-login to update user state with new token/details (simulated)
            const token = localStorage.getItem('token');
            if (token) {
                login(res.data.user, token);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(null);
        }
    };

    const tiers = [
        {
            name: 'FREE',
            price: { monthly: '0', annually: '0' },
            description: '3 negotiations for each product\n25 total negotiations a month',
            features: ['Browse Marketplace', 'Make Basic Offers', 'Standard Support'],
            buttonStyle: 'bg-gray-800 hover:bg-gray-700 text-white',
        },
        {
            name: 'PRO',
            price: { monthly: '199', annually: '2200' },
            discount: '7% OFF',
            description: '5 negotiations for each product\n50 total negotiations a month',
            features: ['Priority Bidding', 'Sell up to 10 items', '24/7 Premium Support', 'Advanced Analytics'],
            buttonStyle: 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]',
            highlight: true,
        },
        {
            name: 'PREMIUM',
            price: { monthly: '399', annually: '4300' },
            discount: '10% OFF',
            description: '10 negotiations for each product\nUnlimited negotiations a month',
            features: ['Zero Selling Fees', 'Unlimited Listings', 'Instant AI Acceptance Bypasses', 'Dedicated Account Manager'],
            buttonStyle: 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]',
        }
    ];

    return (
        <div className="mx-auto max-w-6xl px-8 py-20 text-white">
            <div className="text-center mb-16">
                <h1 className="text-5xl font-black tracking-tighter">
                    CHOOSE YOUR <span className="text-blue-500">TIER</span>
                </h1>
                <p className="mt-4 text-xl text-gray-400">Unlock the full power of Negotix.</p>
            </div>

            <div className="flex justify-center mb-12">
                <div className="bg-gray-900 border border-white/10 rounded-full p-1 inline-flex items-center relative">
                    <button
                        onClick={() => setIsAnnual(false)}
                        className={`relative z-10 px-8 py-3 text-sm font-bold rounded-full transition-colors ${!isAnnual ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setIsAnnual(true)}
                        className={`relative z-10 px-8 py-3 text-sm font-bold rounded-full transition-colors ${isAnnual ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Annually
                    </button>
                    {/* Sliding background highlight */}
                    <motion.div
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-full z-0"
                        animate={{ left: isAnnual ? 'calc(50% + 2px)' : '4px' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tiers.map((tier, idx) => {
                    const isCurrentPlan = user?.subscriptionTier === tier.name;

                    return (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative flex flex-col rounded-3xl p-8 border ${tier.highlight ? 'border-blue-500/50 bg-gray-900/80 shadow-2xl scale-105 z-10' : 'border-white/10 bg-black/50'
                                }`}
                        >
                            {tier.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 text-xs font-bold rounded-full">
                                    MOST POPULAR
                                </div>
                            )}

                            <h3 className="text-2xl font-black">{tier.name}</h3>
                            <div className="mt-4 flex items-baseline text-5xl font-extrabold tracking-tighter relative">
                                <span className="text-3xl text-gray-500">₹</span>
                                {isAnnual ? tier.price.annually : tier.price.monthly}
                                <span className="text-lg text-gray-500 font-medium ml-2">/{isAnnual ? 'yr' : 'mo'}</span>
                                {isAnnual && tier.discount && (
                                    <span className="absolute -top-4 right-0 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-1 rounded-full">{tier.discount}</span>
                                )}
                            </div>

                            <div className="mt-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                                <p className="text-sm font-medium text-gray-300 whitespace-pre-line leading-relaxed">{tier.description}</p>
                            </div>

                            <ul className="mt-8 flex-1 space-y-4">
                                {tier.features.map(feature => (
                                    <li key={feature} className="flex items-center space-x-3 text-sm text-gray-300">
                                        <span className="text-green-500">✔</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleUpgrade(tier.name as any)}
                                disabled={isCurrentPlan || loading === tier.name}
                                className={`mt-8 w-full rounded-xl py-4 font-bold transition-all ${isCurrentPlan
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                                    : tier.buttonStyle
                                    }`}
                            >
                                {loading === tier.name ? 'Processing...' : isCurrentPlan ? 'Current Plan' : `Upgrade to ${tier.name}`}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
