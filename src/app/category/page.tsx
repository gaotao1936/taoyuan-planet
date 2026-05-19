'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { mockCategories } from '@/data/mockData';
import { Product } from '@/lib/types';

export default function CategoryPage() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('default');
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('taoyuan_products');
    if (stored) setAllProducts(JSON.parse(stored));
  }, []);

  const filteredProducts = useMemo(() => {
    let products = activeCategory
      ? allProducts.filter((p) => p.categoryId === activeCategory)
      : [...allProducts];

    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'sales':
        products.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case 'newest':
        products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
    }
    return products;
  }, [activeCategory, sortBy, allProducts]);

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>分类浏览</h1>
          <p className="text-[#999]">根据品类探索你喜欢的文创作品</p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === null
                ? 'bg-[#E07B5A] text-white shadow-md'
                : 'bg-white text-[#5C5C5C] hover:bg-white/80 border border-black/5'
            }`}
          >
            全部
          </button>
          {mockCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-[#E07B5A] text-white shadow-md'
                  : 'bg-white text-[#5C5C5C] hover:bg-white/80 border border-black/5'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-sm text-[#bbb]">排序：</span>
          {[
            { key: 'default', label: '默认' },
            { key: 'sales', label: '销量最高' },
            { key: 'newest', label: '最新上架' },
            { key: 'price-asc', label: '价格从低到高' },
            { key: 'price-desc', label: '价格从高到低' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === opt.key
                  ? 'bg-[#2C2C2C] text-white'
                  : 'bg-white text-[#999] hover:bg-white/80 border border-black/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.filter(p => p.status === 'approved').map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">📦</span>
            <p className="text-[#bbb]">该分类暂无作品</p>
          </div>
        )}
      </div>
    </div>
  );
}
