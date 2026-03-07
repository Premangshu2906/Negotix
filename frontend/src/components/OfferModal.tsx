'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { useStore } from '@/store/useStore';
import api from '@/lib/axios';

interface OfferModalProps {
    productId: string;
    publicPrice: number;
    isOpen: boolean;
    onClose: () => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({ productId, publicPrice, isOpen, onClose }) => {
    const [offer, setOffer] = useState<number>(publicPrice * 0.8);
    const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED'>('IDLE');
    const [counterAmount, setCounterAmount] = useState<number>(0);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const user = useStore((state) => state.user);

    // Gamification color interpolator hook based on discount depth
    const getLikelihoodColor = () => {
        const percentage = offer / publicPrice;
        if (percentage >= 0.9) return 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]';
        if (percentage >= 0.75) return 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]';
        return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
    };

    useEffect(() => {
        if (!isOpen || !user) return;
        const socket = getSocket();

        socket.on(`offer_accepted_${user.id}`, (data) => {
            setStatus('ACCEPTED');
        });

        socket.on(`offer_rejected_${user.id}`, (data) => {
            setStatus('REJECTED');
        });

        socket.on(`offer_countered_${user.id}`, (data) => {
            setStatus('COUNTERED');
            setCounterAmount(data.offer.offerAmount);
        });

        return () => {
            socket.off(`offer_accepted_${user.id}`);
            socket.off(`offer_rejected_${user.id}`);
            socket.off(`offer_countered_${user.id}`);
        };
    }, [isOpen, user]);

    const handleSubmitOffer = async () => {
        setStatus('PENDING');
        setErrorMsg('');
        try {
            await api.post('/offers', { productId, offerAmount: offer });
        } catch (error: any) {
            console.error(error);
            setStatus('IDLE');
            setErrorMsg(error.response?.data?.error || 'Failed to submit offer. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-6 text-white shadow-2xl"
            >
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">✕</button>

                <h2 className="mb-6 text-2xl font-bold tracking-tight">Make Your Pitch</h2>

                {status === 'IDLE' && (
                    <div className="space-y-8">
                        {errorMsg && (
                            <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 text-center">
                                {errorMsg}
                            </div>
                        )}
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-400">Your Offer</p>
                            <div className="mt-2 flex items-center justify-center text-5xl font-extrabold tracking-tighter">
                                <span className="text-gray-500">₹</span>
                                <input
                                    type="number"
                                    value={offer}
                                    onChange={(e) => setOffer(Number(e.target.value))}
                                    className="w-32 bg-transparent text-center focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="relative pt-1">
                            <input
                                type="range"
                                min={publicPrice * 0.4}
                                max={publicPrice}
                                value={offer}
                                onChange={(e) => setOffer(Number(e.target.value))}
                                className={`h-2 w-full appearance-none rounded-full transition-colors ${getLikelihoodColor()}`}
                            />
                            <div className="mt-4 flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-500">
                                <span>Lowball</span>
                                <span>Fair Value</span>
                                <span>Strong Pitch</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmitOffer}
                            className={`w-full rounded-xl py-4 font-bold text-white transition-all hover:scale-105 active:scale-95 ${getLikelihoodColor()}`}
                        >
                            Submit Pitch
                        </button>
                    </div>
                )}

                {status === 'PENDING' && (
                    <div className="flex flex-col items-center justify-center space-y-4 py-12">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="relative flex h-24 w-24 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                        >
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </motion.div>
                        <p className="font-semibold text-blue-400">Seller AI is thinking...</p>
                    </div>
                )}

                {status === 'ACCEPTED' && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col items-center justify-center space-y-6 py-8"
                    >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.6)]">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-extrabold text-green-400">OFFER ACCEPTED!</h3>
                            <p className="mt-2 text-gray-300 text-sm">You have secured the deal at ₹{offer}.</p>
                        </div>

                        {/* Countdown placeholder */}
                        <div className="w-full rounded-xl bg-gray-800 p-4 text-center">
                            <p className="text-xs font-semibold uppercase tracking-widest text-red-400">Time to Pay</p>
                            <p className="mt-1 text-4xl font-black text-white font-mono tracking-tighter shadow-sm">10:00</p>
                        </div>

                        <button className="w-full rounded-xl bg-white py-4 font-bold text-black transition hover:bg-gray-200">
                            Checkout Now
                        </button>
                    </motion.div>
                )}

                {status === 'COUNTERED' && (
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex flex-col items-center justify-center space-y-6 py-6 text-center"
                    >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                            <span className="text-3xl text-black">🤝</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">The Seller Countered</h3>
                            <p className="mt-2 text-gray-400">Your offer was slightly too low. How about this?</p>
                            <p className="mt-4 text-5xl font-black text-yellow-400">₹{counterAmount}</p>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-4">
                            <button
                                onClick={() => setStatus('IDLE')}
                                className="rounded-lg border border-gray-700 bg-gray-800 py-3 font-semibold text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => {
                                    setOffer(counterAmount);
                                    handleSubmitOffer();
                                }}
                                className="rounded-lg bg-yellow-500 py-3 font-bold text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:bg-yellow-400"
                            >
                                Accept Deal
                            </button>
                        </div>
                    </motion.div>
                )}

                {status === 'REJECTED' && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center space-y-4 py-8 text-center"
                    >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 text-red-500">
                            ✕
                        </div>
                        <h3 className="text-xl font-bold text-white">Offer Rejected</h3>
                        <p className="text-sm text-gray-400 outline-none border-none">Your offer of ₹{offer} was too low for the seller.</p>
                        <button
                            onClick={() => setStatus('IDLE')}
                            className="mt-6 w-full rounded-lg bg-gray-800 py-3 font-semibold text-white hover:bg-gray-700"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

            </motion.div>
        </div>
    );
};
