'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');

  const getPrimaryImage = (imagesStr: any) => {
    let imgPath = imagesStr;
    try {
      const parsed = JSON.parse(imagesStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imgPath = parsed[0];
      }
    } catch {
      imgPath = imagesStr;
    }

    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070';
    }

    if (imgPath.startsWith('http')) {
      return imgPath;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${baseUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products?category=${category}`);
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            YOUR ALL IN <span className="text-blue-500">ONE PLACE</span>
          </h1>
          <p className="text-gray-400">Discover exclusive items and make your best offer.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'FERTILIZERS', 'SEEDS', 'ORGANIC SUBSTANCES'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${category === cat
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-white/10 rounded-3xl bg-gray-900/20 backdrop-blur-sm">
          <p className="text-2xl font-bold text-gray-500 mb-2">No items available right now.</p>
          <p className="text-gray-600">Check back soon for new your all in one place.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gray-900 shadow-2xl transition hover:border-blue-500/50"
            >
              {/* Image Box */}
              <div className="relative aspect-square w-full overflow-hidden bg-white flex items-center justify-center p-4">
                <img
                  src={getPrimaryImage(product.images)}
                  alt={product.title}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute top-4 left-4 rounded-full border border-green-500/30 bg-green-500/90 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
                  LIVE
                </div>
                <div className="absolute bottom-4 right-4 rounded-full bg-black/80 px-3 py-1 text-sm font-bold text-white backdrop-blur-md border border-white/10 shadow-lg">
                  ₹{product.publicPrice}
                </div>
              </div>

              {/* Content Box */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{product.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-1">{product.description}</p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center space-x-2 text-xs font-medium text-gray-500">
                    <span>Seller:</span>
                    <span className="text-gray-300">{product.seller?.name || 'Anon'}</span>
                  </div>
                  <Link
                    href={`/product/${product.id}`}
                    className="rounded-xl border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-400 transition hover:bg-blue-500 hover:text-white"
                  >
                    View & Bid
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
