'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();
  const { items, total } = state;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🛒</span>
          <h2 className="text-xl font-bold text-[#2C2C2C] mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>购物车是空的</h2>
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
            购物车 ({state.itemCount})
          </motion.h1>
          <button
            onClick={clearCart}
            className="text-sm text-[#999] hover:text-[#E07B5A] transition-colors"
          >
            清空购物车
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                className="bg-white rounded-2xl p-4 flex gap-4 items-center border border-black/5"
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-24 h-24 rounded-xl object-cover bg-[#FEF5EC]"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#2C2C2C] text-sm line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-[#999] mt-1">{item.creatorName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[#E07B5A] font-bold">¥{item.price}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#FEF5EC] transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#FEF5EC] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs text-[#bbb] hover:text-red-500 mt-2 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-2xl p-6 flex items-center justify-between sticky bottom-4 shadow-lg border border-black/5"
        >
          <div>
            <span className="text-sm text-[#999]">合计</span>
            <div className="text-2xl font-bold text-[#E07B5A]">¥{total.toFixed(2)}</div>
          </div>
          <Link
            href="/order-confirm"
            className="px-8 py-3.5 bg-gradient-to-r from-[#E07B5A] to-[#D4946A] text-white font-semibold rounded-full hover:shadow-lg hover:shadow-[#E07B5A]/20 transition-all"
          >
            去结算
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
