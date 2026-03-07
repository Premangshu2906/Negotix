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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300">NEGOTIATE. </span>
              <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">BUY. SAVE.</span>
            </h1>

            <div className="flex flex-wrap lg:flex-nowrap justify-center lg:justify-start gap-4 w-[110%] md:w-full pb-6 lg:pb-2">
              {['ALL', 'ELECTRONICS', 'TOYS', 'DECOR', 'OTHERS'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{ borderRadius: '50%' }}
                  className={`px-5 py-2.5 text-xs md:text-sm font-bold tracking-wider transition-all duration-300 border-2 ${category === cat
                    ? 'border-blue-500 bg-blue-600/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-105'
                    : 'border-white/10 bg-black/50 text-gray-400 hover:border-blue-400/50 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] backdrop-blur-sm'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Animated Mock Chat Window */}
          <div className="relative w-full max-w-md mx-auto lg:ml-auto">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              {/* Chat header */}
              <div className="flex items-center space-x-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white shadow-lg">AI</div>
                <div>
                  <h3 className="text-sm font-bold text-white">Negotix AI</h3>
                  <p className="text-xs text-green-400 font-medium flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></span> Analyzing Deals</p>
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex justify-end"
                >
                  <div className="bg-white/10 border border-white/10 text-white text-sm py-3 px-5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-lg backdrop-blur-sm">
                    Can you do <span className="font-bold text-blue-300">$150</span>?
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 0.5 }}
                  className="flex justify-start"
                >
                  <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 text-blue-50 text-sm py-3 px-5 rounded-2xl rounded-tl-sm max-w-[90%] shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 -translate-x-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-light-sweep" style={{ animationDelay: '3s' }} />
                    I can drop it to <span className="font-bold text-white">$165</span> with free shipping. Deal?
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Decorative elements behind the chat */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] -z-10 animate-orb-shift" />
            <div className="absolute -bottom-10 -left-6 w-40 h-40 bg-purple-500/20 rounded-full blur-[50px] -z-10 animate-orb-shift" style={{ animationDelay: '2s' }} />
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
