'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { OfferModal } from '@/components/OfferModal';
import api from '@/lib/axios';

export default function ProductPage() {
    const { id } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeImageIdx, setActiveImageIdx] = useState(0);

    const getImages = (imagesStr: any) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const resolveUrl = (path: string) => {
            if (!path) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070';
            if (path.startsWith('http')) return path;
            return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
        };

        try {
            const parsed = JSON.parse(imagesStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(resolveUrl);
            }
            return [resolveUrl(imagesStr)];
        } catch {
            return [resolveUrl(imagesStr)];
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
            } catch (err) {
                console.error('Failed to fetch product', err);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-16 h-16"
                >
                    <img src="/images/custom-logo.png" alt="Loading" className="object-contain w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </motion.div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
                <p className="text-xl text-gray-500">Product not found</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-8 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-16 md:grid-cols-2"
            >
                {/* Product Image Panel */}
                <div className="flex flex-col space-y-4">
                    <div className="relative aspect-square w-full rounded-3xl bg-white shadow-2xl overflow-hidden group flex items-center justify-center p-8 border border-white/5">
                        <img
                            src={getImages(product.images)[activeImageIdx]}
                            alt={product.title}
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-6 left-6 flex items-center space-x-3 z-10">
                            <div className="rounded-full bg-blue-600/90 px-4 py-1.5 text-xs font-black tracking-widest text-white shadow-xl backdrop-blur-md">
                                {product.category}
                            </div>
                        </div>
                    </div>

                    {getImages(product.images).length > 1 && (
                        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide py-2">
                            {getImages(product.images).map((imgUrl: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIdx(idx)}
                                    className={`relative h-20 w-20 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-xl border-2 transition-all bg-white ${activeImageIdx === idx ? 'border-blue-500 scale-105 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'border-gray-700 opacity-60 hover:opacity-100 hover:border-gray-500'
                                        }`}
                                >
                                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain p-1" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details & Action Panel */}
                <div className="flex flex-col justify-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center space-x-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400 uppercase tracking-widest">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span>Live Bidding Active</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight text-white mb-4">{product.title}</h1>
                        <p className="text-lg text-gray-400 leading-relaxed">{product.description}</p>
                    </div>

                    <div className="mt-12 space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">Retail Price</p>
                        <p className="text-6xl font-black tracking-tighter shadow-sm text-white">₹{product.publicPrice}</p>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-4">
                        <button className="rounded-2xl bg-white px-8 py-5 text-lg font-bold text-black transition hover:bg-gray-200">
                            Buy It Now
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group relative overflow-hidden rounded-2xl bg-blue-600 px-8 py-5 text-lg font-bold text-white transition hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                        >
                            <span className="relative z-10 flex items-center justify-center space-x-2">
                                <span>Make an Offer</span>
                                <span className="transition-transform group-hover:translate-x-1">→</span>
                            </span>
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                        </button>
                    </div>

                    <div className="mt-12 rounded-2xl border border-white/10 bg-gray-900/50 p-6 flex flex-col space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Seller Information</h3>
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xl font-bold border border-white/10">
                                {product.seller?.name?.charAt(0) || 'A'}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-white">{product.seller?.name || 'Anonymous'}</p>
                                <div className="flex items-center space-x-1 mt-1 text-sm font-medium">
                                    <span className="text-gray-500">Reputation:</span>
                                    <span className="text-yellow-500 font-bold flex items-center">
                                        {product.seller?.reputationScore || 100} <span className="ml-1">⭐</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* The Gamified Offer Modal */}
            {isModalOpen && (
                <OfferModal
                    productId={product.id}
                    publicPrice={product.publicPrice}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
