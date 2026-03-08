'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { CreativePricing, type PricingTier } from '@/components/ui/creative-pricing';
import { Shield, Zap, Crown, Pencil } from 'lucide-react';

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

    const creativeTiers: PricingTier[] = [
        {
            name: 'FREE',
            price: isAnnual ? 0 : 0,
            description: '3 negotiations for each product\n25 total negotiations a month',
            features: ['Browse Marketplace', 'Make Basic Offers', 'Standard Support'],
            color: 'yellow',
            icon: <Pencil className="w-6 h-6 text-[#fbbf24]" />,
            buttonText: loading === 'FREE' ? 'Processing...' : user?.subscriptionTier === 'FREE' ? 'Current Plan' : 'Get Started',
            onButtonClick: () => handleUpgrade('FREE'),
            disabled: user?.subscriptionTier === 'FREE' || loading !== null,
            interval: isAnnual ? '/yr' : '/mo'
        },
        {
            name: 'PRO',
            price: isAnnual ? 2200 : 199,
            description: '5 negotiations for each product\n50 total negotiations a month',
            features: ['Priority Bidding', 'Sell up to 10 items', '24/7 Premium Support', 'Advanced Analytics'],
            color: 'blue',
            icon: <Zap className="w-6 h-6 text-[#3b82f6]" />,
            buttonText: loading === 'PRO' ? 'Processing...' : user?.subscriptionTier === 'PRO' ? 'Current Plan' : 'Get Started',
            onButtonClick: () => handleUpgrade('PRO'),
            disabled: user?.subscriptionTier === 'PRO' || loading !== null,
            popular: true,
            interval: isAnnual ? '/yr' : '/mo'
        },
        {
            name: 'PREMIUM',
            price: isAnnual ? 4300 : 399,
            description: '10 negotiations for each product\nUnlimited negotiations a month',
            features: ['Zero Selling Fees', 'Unlimited Listings', 'Instant AI Acceptance Bypasses', 'Dedicated Account Manager'],
            color: 'white',
            icon: <Crown className="w-6 h-6" />,
            buttonText: loading === 'PREMIUM' ? 'Processing...' : user?.subscriptionTier === 'PREMIUM' ? 'Current Plan' : 'Get Started',
            onButtonClick: () => handleUpgrade('PREMIUM'),
            disabled: user?.subscriptionTier === 'PREMIUM' || loading !== null,
            interval: isAnnual ? '/yr' : '/mo'
        }
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-32 text-white min-h-screen">
            <div className="flex justify-center mb-16 relative z-20">
                <div className="bg-gray-900 border border-white/10 rounded-full p-1 inline-flex items-center relative shadow-lg">
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
                        <span className="absolute -top-3 -right-3 px-2 py-0.5 bg-green-500 text-white text-[10px] uppercase font-bold rounded-full shadow-md">
                            Save up to 10%
                        </span>
                    </button>
                    <motion.div
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-full z-0"
                        animate={{ left: isAnnual ? 'calc(50% + 2px)' : '4px' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                </div>
            </div>

            <CreativePricing
                tag="Unlock Potential"
                title="Choose Your Tier"
                description="Power up your negotiations."
                tiers={creativeTiers}
            />
        </div>
    );
}
