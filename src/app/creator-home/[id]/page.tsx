'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { mockCreators, mockProducts, mockPosts } from '@/data/mockData';
import ProductCard from '@/components/ProductCard';
import PostCard from '@/components/PostCard';
import { Creator } from '@/lib/types';

export default function CreatorHomePage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = Number(params.id);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'posts'>('products');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const found = mockCreators.find(c => c.id === creatorId);
    setCreator(found || null);
  }, [creatorId]);

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">🎨</span>
          <h2 className="text-xl font-bold text-[#2C2C2C] mb-2">创作者未找到</h2>
          <Link href="/community" className="text-[#E07B5A] hover:underline">返回社区</Link>
        </div>
      </div>
    );
  }

  const products = mockProducts.filter(p => p.creatorId === creator.id);
  const posts = mockPosts.filter(p => p.userId === creator.id);

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      {/* Creator header */}
      <div className="bg-white border-b border-black/5">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#999] hover:text-[#2C2C2C] mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <img src={creator.avatar} alt={creator.name} className="w-24 h-24 rounded-full mx-auto mb-5 bg-[#FEF5EC] border-4 border-white shadow-md" />
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-[#2C2C2C]" style={{ fontFamily: "'Noto Serif SC', serif" }}>{creator.name}</h1>
              <span className="text-xs bg-[#E07B5A] text-white px-2.5 py-0.5 rounded-full font-medium">{creator.level}</span>
            </div>
            <p className="text-sm text-[#999] mb-6 max-w-md mx-auto">{creator.bio}</p>

            {/* Stats */}
            <div className="flex justify-center gap-10 mb-6">
              <div className="text-center">
                <div className="text-xl font-bold text-[#2C2C2C]">{products.length}</div>
                <div className="text-xs text-[#999]">作品</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#2C2C2C]">{creator.fans.toLocaleString()}</div>
                <div className="text-xs text-[#999]">粉丝</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#2C2C2C]">{posts.reduce((s, p) => s + p.likes, 0)}</div>
                <div className="text-xs text-[#999]">获赞</div>
              </div>
            </div>

            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all ${
                isFollowing
                  ? 'bg-[#FEF5EC] text-[#E07B5A] border border-[#E07B5A]/20'
                  : 'bg-[#E07B5A] text-white hover:bg-[#C56A4A]'
              }`}
            >
              {isFollowing ? '✓ 已关注' : '+ 关注'}
            </button>

            {creator.tags && (
              <div className="flex justify-center gap-2 mt-5 flex-wrap">
                {creator.tags.map(tag => (
                  <span key={tag} className="text-xs text-[#E07B5A] bg-[#E07B5A]/6 px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-1 border-t border-black/5 px-4">
          {[
            { key: 'products' as const, label: '作品' },
            { key: 'posts' as const, label: '动态' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-8 py-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-[#E07B5A] text-[#E07B5A]'
                  : 'border-transparent text-[#999] hover:text-[#2C2C2C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'products' ? (
          products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-[#999]">暂无作品</div>
          )
        ) : (
          posts.length > 0 ? (
            <div className="max-w-2xl mx-auto space-y-4">
              {posts.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-[#999]">暂无动态</div>
          )
        )}
      </div>
    </div>
  );
}
