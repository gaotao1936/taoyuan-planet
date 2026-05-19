'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CollectionItem {
  id: number;
  type?: string;
  title?: string;
  content?: string;
  images?: string[];
  userName?: string;
  userAvatar?: string;
  likes?: number;
  collectedAt: string;
  // Product fields
  name?: string;
  price?: number;
  image?: string;
  creatorName?: string;
  category?: string;
}

export default function CollectionsPage() {
  const router = useRouter();
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'posts'>('all');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('taoyuan_collections');
    if (stored) setItems(JSON.parse(stored));
    setLoaded(true);
  }, []);

  const removeItem = (id: number) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('taoyuan_collections', JSON.stringify(updated));
  };

  const filteredItems = activeTab === 'all'
    ? items
    : activeTab === 'products'
      ? items.filter(i => i.price !== undefined)
      : items.filter(i => i.content !== undefined);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#999] hover:text-[#2C2C2C] mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>我的收藏</h1>
          <p className="text-[#999] mb-8">收藏的作品和帖子</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 mb-6 border border-black/5">
          {[
            { key: 'all', label: '全部' },
            { key: 'products', label: '作品' },
            { key: 'posts', label: '帖子' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-[#E07B5A] text-white shadow-sm' : 'text-[#999] hover:text-[#2C2C2C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">❤️</span>
            <p className="text-[#999] mb-4">暂无收藏</p>
            <Link href="/category" className="text-[#E07B5A] hover:underline text-sm">去发现作品</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-black/5 flex gap-4 items-center">
                <img
                  src={item.images?.[0] || item.image || ''}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover bg-[#FEF5EC]"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-[#2C2C2C] line-clamp-1">
                    {item.title || item.name || '无标题'}
                  </h4>
                  <p className="text-xs text-[#bbb] mt-1">
                    {item.price ? `¥${item.price}` : item.userName || ''}
                    {item.creatorName ? ` · ${item.creatorName}` : ''}
                  </p>
                  <p className="text-xs text-[#ccc] mt-0.5">
                    收藏于 {new Date(item.collectedAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-[#999] hover:text-red-400 transition-colors shrink-0"
                >
                  取消收藏
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
