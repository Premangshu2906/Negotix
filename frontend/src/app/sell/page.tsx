'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

export default function SellPage() {
    const { user } = useStore();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('OTHERS');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [publicPrice, setPublicPrice] = useState('');
    const [autoAccept, setAutoAccept] = useState('');
    const [autoCounter, setAutoCounter] = useState('');
    const [inventoryCount, setInventoryCount] = useState('1');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const price = parseFloat(publicPrice);
        const acceptFloor = parseFloat(autoAccept);
        const counterFloor = parseFloat(autoCounter);

        if (acceptFloor > price) {
            setError('Auto-accept price cannot be higher than public price.');
            setIsLoading(false);
            return;
        }

        if (counterFloor > acceptFloor) {
            setError('Auto-counter floor cannot be higher than auto-accept price.');
            setIsLoading(false);
            return;
        }

        try {
            // First upload images if they exist
            let uploadedImageUrls = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070';

            if (imageFiles.length > 0) {
                if (imageFiles.length > 5) {
                    setError('You can only upload a maximum of 5 images.');
                    setIsLoading(false);
                    return;
                }
                const formData = new FormData();
                imageFiles.forEach(file => formData.append('images', file));

                const uploadRes = await api.post('/uploads', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Save all uploaded URLs as a JSON string array
                if (uploadRes.data.urls && uploadRes.data.urls.length > 0) {
                    const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                    const fullUrls = uploadRes.data.urls.map((url: string) => `${backendBase}${url}`);
                    uploadedImageUrls = JSON.stringify(fullUrls);
                }
            }

            // Then create the product
            await api.post('/products', {
                title,
                description,
                category,
                images: uploadedImageUrls,
                publicPrice: price,
                autoAcceptFloorPrice: acceptFloor,
                autoCounterFloorPrice: counterFloor,
                inventoryCount: parseInt(inventoryCount) || 1
            });
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to list product');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) return null;

    return (
        <div className="mx-auto max-w-3xl px-8 py-12 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/10 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-xl"
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tighter">
                        LIST AN <span className="text-purple-500">ITEM</span>
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">Add a new premium item to the marketplace.</p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-400">Product Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                            placeholder="Rare Vintage Watch"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-400">Description</label>
                        <textarea
                            required
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                            placeholder="Describe the item details, condition, and why it's premium..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-400">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                            >
                                <option value="ALL">All Categories</option>
                                <option value="ELECTRONICS">Electronics</option>
                                <option value="TOYS">Toys</option>
                                <option value="DECOR">Decor</option>
                                <option value="OTHERS">Others</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-400">Direct Image Upload</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        const files = Array.from(e.target.files);
                                        if (files.length > 5) {
                                            setError('You can only upload a maximum of 5 images.');
                                            return;
                                        }
                                        const maxSize = 50 * 1024 * 1024; // 50MB
                                        if (files.some(file => file.size > maxSize)) {
                                            setError('Each image must be smaller than 50MB.');
                                            return;
                                        }
                                        setError('');
                                        setImageFiles(files);
                                    }
                                }}
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500 transition-colors cursor-pointer"
                            />
                            {imageFiles.length > 0 && (
                                <div className="mt-4 grid grid-cols-5 gap-2">
                                    {imageFiles.map((file, idx) => (
                                        <div key={idx} className="relative aspect-square w-full rounded-lg overflow-hidden border border-white/10">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${idx + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-400">Public Price (₹)</label>
                            <input
                                type="number"
                                required
                                min={1}
                                value={publicPrice}
                                onChange={(e) => setPublicPrice(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                placeholder="1000"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-400">Auto-Accept Floor (₹)</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    value={autoAccept}
                                    onChange={(e) => setAutoAccept(e.target.value)}
                                    className="w-full rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400 focus:border-green-500 outline-none"
                                    placeholder="800"
                                />
                                <div className="absolute inset-x-0 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-green-400 bg-black py-1 px-2 rounded">
                                    Offers &ge; this are immediately accepted by AI.
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-400">Auto-Counter Floor (₹)</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    value={autoCounter}
                                    onChange={(e) => setAutoCounter(e.target.value)}
                                    className="w-full rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-yellow-400 focus:border-yellow-500 outline-none"
                                    placeholder="600"
                                />
                                <div className="absolute inset-x-0 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-yellow-400 z-10 bg-black py-1 px-2 rounded">
                                    Offers &lt; this are auto-rejected. Offers between Accept and Counter will receive an AI Counter.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Count */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-400">Items Available (Inventory)</label>
                        <input
                            type="number"
                            required
                            min={1}
                            max={999}
                            value={inventoryCount}
                            onChange={(e) => setInventoryCount(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                            placeholder="1"
                        />
                        <p className="mt-1 text-xs text-gray-500">How many units of this item do you have to sell?</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full overflow-hidden rounded-xl bg-purple-600 px-4 py-4 font-bold text-white transition hover:bg-purple-500 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="relative z-10">{isLoading ? 'Listing...' : 'List Item'}</span>
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                    </button>

                    <div className="text-center font-medium mt-4">
                        <Link href="/" className="text-sm text-gray-500 hover:text-white transition">Cancel</Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
