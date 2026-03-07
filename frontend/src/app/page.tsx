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
    <div className="relative min-h-screen w-full bg-black overflow-hidden bg-dot-matrix">
      {/* Vibrant Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/30 blur-[120px] pointer-events-none animate-orb-shift" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none animate-orb-shift" style={{ animationDelay: '5s' }} />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-green-500/10 blur-[100px] pointer-events-none animate-orb-shift" style={{ animationDelay: '10s' }} />

      <div className="relative mx-auto max-w-7xl px-8 py-12 z-10">

        {/* HERO SECTION GRID */}
        <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT SIDE: Text and Categories */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left pt-8">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0, duration: 0.5 }}
                className="text-white inline-block mr-3 mb-2 lg:mb-0"
              >
                NEGOTIATE.
              </motion.span>
              <br className="hidden lg:block" />
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 inline-block mr-3 mb-2 lg:mb-0"
              >
                BUY.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 inline-block"
              >
                SAVE.
              </motion.span>
            </h1>

            <div className="flex flex-wrap lg:flex-nowrap justify-center lg:justify-start gap-4 w-[110%] md:w-full pb-6 lg:pb-2">
              {['ALL', 'ELECTRONICS', 'TOYS', 'DECOR', 'OTHERS'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-2.5 text-xs md:text-sm font-bold tracking-wider transition-all duration-300 rounded-xl bg-white/5 backdrop-blur-sm border-b-2 border-transparent ${category === cat
                    ? 'border-blue-500 text-white shadow-[0_4px_20px_rgba(59,130,246,0.4)]'
                    : 'text-gray-400 hover:text-white hover:border-blue-500/50 hover:shadow-[0_4px_15px_rgba(59,130,246,0.2)]'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Animated Data Visualization */}
          <div className="relative w-full max-w-md mx-auto lg:ml-auto h-64 flex items-center justify-center">
            <svg
              viewBox="0 0 400 200"
              className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              preserveAspectRatio="none"
            >
              {/* Neon Line Graph tracking downwards */}
              <motion.path
                d="M 20 60 Q 80 40, 140 100 T 260 140 T 360 170"
                fill="none"
                stroke="url(#neonGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />

              {/* Glowing endpoint dot */}
              <motion.circle
                cx="360"
                cy="170"
                r="6"
                fill="#3B82F6"
                className="drop-shadow-[0_0_15px_rgba(59,130,246,1)]"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                transition={{
                  delay: 2,
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <defs>
                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Decorative elements behind the graph */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-blue-500/10 rounded-full blur-[50px] -z-10 animate-orb-shift" />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-gray-900/40 to-black/60 backdrop-blur-md shadow-2xl">
            {/* Radar Rings */}
            <div className="absolute flex items-center justify-center pointer-events-none">
              <div className="absolute w-16 h-16 border border-blue-500/30 rounded-full animate-radar-pulse" />
              <div className="absolute w-16 h-16 border border-blue-500/20 rounded-full animate-radar-pulse" style={{ animationDelay: '0.6s' }} />
              <div className="absolute w-16 h-16 border border-blue-500/10 rounded-full animate-radar-pulse" style={{ animationDelay: '1.2s' }} />
            </div>

            <div className="relative z-10 w-16 h-16 mb-6 opacity-80 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
              <img src="/images/logo.png" alt="Scanning" className="object-contain w-full h-full grayscale opacity-50" />
            </div>

            <p className="relative z-10 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600 mb-2 mt-4">
              AI is scouting the best deals...
            </p>
            <p className="relative z-10 text-gray-600 text-sm font-medium">
              The grid is currently empty. Check back shortly.
            </p>
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
    </div>
  );
}
