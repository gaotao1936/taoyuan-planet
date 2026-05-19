'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🤍</span>
          <h2 className="text-xl font-bold text-[#2C2C2C] mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>收藏夹是空的</h2>
          <p className="text-[#999] mb-6">去发现一些喜欢的作品吧</p>
          <Link href="/category" className="inline-flex px-6 py-3 bg-[#E07B5A] text-white rounded-full font-medium hover:bg-[#C56A4A] transition-colors">
            去逛逛
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[#2C2C2C]"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            我的收藏 ({items.length})
          </motion.h1>
          <button
            onClick={clearWishlist}
            className="text-sm text-[#999] hover:text-[#E07B5A] transition-colors"
          >
            清空收藏
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl overflow-hidden border border-black/5 group"
            >
              <Link href={`/product/${item.id}`} className="block aspect-square bg-[#FEF5EC] overflow-hidden">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="p-3">
                <h3 className="font-medium text-sm text-[#2C2C2C] line-clamp-1">{item.title}</h3>
                <p className="text-xs text-[#999] mt-0.5">{item.creatorName}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[#E07B5A] font-bold">¥{item.price}</span>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="text-lg hover:scale-110 transition-transform"
                  >
                    ❤️
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
