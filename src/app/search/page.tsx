'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import PostCard from '@/components/PostCard';
import { Product, Post } from '@/lib/types';

const hotSearches = ['明信片', '陶瓷', '非遗', '故宫', '手工', '丝巾', '和田玉', '竹编'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'posts'>('products');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    }
    return [];
  });

  useEffect(() => {
    const products = localStorage.getItem('taoyuan_products');
    if (products) setAllProducts(JSON.parse(products));
    const posts = localStorage.getItem('taoyuan_posts');
    if (posts) setAllPosts(JSON.parse(posts));
  }, []);

  const productResults = useMemo(
    () => allProducts.filter((p) => p.title.includes(query) || p.tags?.some((t) => t.includes(query)) || p.description.includes(query)),
    [query, allProducts]
  );

  const postResults = useMemo(
    () => allPosts.filter((p) => p.content.includes(query) || p.tags?.some((t) => t.includes(query))),
    [query, allPosts]
  );

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q && !history.includes(q)) {
      const updated = [q, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
    }
  };

  const showResults = query.length > 0;

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-6 sticky top-20 z-10">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#bbb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索作品或帖子..."
              autoFocus
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-black/5 rounded-2xl text-sm focus:outline-none focus:border-[#E07B5A] focus:ring-4 focus:ring-[#E07B5A]/5 transition-all"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#5C5C5C]">
                ✕
              </button>
            )}
          </div>
        </div>

        {showResults ? (
          <>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'products' ? 'bg-[#E07B5A] text-white' : 'bg-white text-[#5C5C5C] border border-black/5'
                }`}
              >
                作品 ({productResults.length})
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'posts' ? 'bg-[#E07B5A] text-white' : 'bg-white text-[#5C5C5C] border border-black/5'
                }`}
              >
                帖子 ({postResults.length})
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'products' ? (
                <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {productResults.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {productResults.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-[#bbb]">未找到相关作品</div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {postResults.length > 0 ? postResults.map((p) => <PostCard key={p.id} post={p} />) : (
                    <div className="text-center py-20 text-[#bbb]">未找到相关帖子</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <>
            {history.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#5C5C5C]">搜索历史</h3>
                  <button onClick={clearHistory} className="text-xs text-[#bbb] hover:text-red-500">清空</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((h) => (
                    <button
                      key={h}
                      onClick={() => handleSearch(h)}
                      className="px-4 py-2 bg-white border border-black/5 rounded-full text-sm text-[#5C5C5C] hover:border-[#E07B5A] hover:text-[#E07B5A] transition-colors"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-[#5C5C5C] mb-3">热门搜索</h3>
              <div className="flex flex-wrap gap-2">
                {hotSearches.map((h) => (
                  <button
                    key={h}
                    onClick={() => handleSearch(h)}
                    className="px-4 py-2 bg-white border border-black/5 rounded-full text-sm text-[#5C5C5C] hover:border-[#E07B5A] hover:text-[#E07B5A] transition-colors"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
